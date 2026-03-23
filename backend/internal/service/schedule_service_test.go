package service

import (
	"context"
	"testing"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupScheduleTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Auto migrate models
	err = db.AutoMigrate(&models.Schedule{})
	if err != nil {
		t.Fatalf("Failed to migrate models: %v", err)
	}

	return db
}

func TestScheduleService_CreateSchedule(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	now := time.Now()
	endTime := now.Add(2 * time.Hour)

	tests := []struct {
		name      string
		schedule  *models.Schedule
		wantError bool
	}{
		{
			name: "valid schedule",
			schedule: &models.Schedule{
				Title:     "Test Date",
				Icon:      "💕",
				StartTime: now,
				EndTime:   endTime,
				Type:      models.ScheduleTypeDate,
				Reminder:  models.ReminderTypeNone,
				Status:    models.ScheduleStatusPlanned,
			},
			wantError: false,
		},
		{
			name: "invalid schedule type",
			schedule: &models.Schedule{
				Title:     "Test",
				StartTime: now,
				EndTime:   endTime,
				Type:      "invalid",
			},
			wantError: true,
		},
		{
			name: "end time before start time",
			schedule: &models.Schedule{
				Title:     "Test",
				StartTime: endTime,
				EndTime:   now,
				Type:      models.ScheduleTypeDate,
			},
			wantError: true,
		},
		{
			name: "invalid reminder type",
			schedule: &models.Schedule{
				Title:     "Test",
				StartTime: now,
				EndTime:   endTime,
				Type:      models.ScheduleTypeDate,
				Reminder:  "invalid",
			},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.CreateSchedule(context.Background(), tt.schedule)
			if tt.wantError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, tt.schedule.ID)
			}
		})
	}
}

func TestScheduleService_GetScheduleByID(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	// Create a test schedule
	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Test Date",
		Icon:      "💕",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(2 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Status:    models.ScheduleStatusPlanned,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Test get existing schedule
	found, err := service.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, schedule.ID, found.ID)
	assert.Equal(t, "Test Date", found.Title)

	// Test get non-existing schedule
	_, err = service.GetScheduleByID(context.Background(), "non-existent")
	assert.Error(t, err)
	assert.Equal(t, ErrScheduleNotFound, err)
}

func TestScheduleService_UpdateSchedule(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	// Create a test schedule
	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Original Title",
		Icon:      "💕",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(2 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
		Status:    models.ScheduleStatusPlanned,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Update the schedule
	schedule.Title = "Updated Title"
	err = service.UpdateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Verify update
	updated, err := repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Title", updated.Title)
}

func TestScheduleService_DeleteSchedule(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	// Create a test schedule
	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "To Delete",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(2 * time.Hour),
		Type:      models.ScheduleTypeDate,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Delete the schedule
	err = service.DeleteSchedule(context.Background(), schedule.ID)
	assert.NoError(t, err)

	// Verify deletion (should return error or soft-deleted)
	_, err = repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.Error(t, err)
}

func TestScheduleService_GetUpcomingSchedules(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	ctx := context.Background()

	// Create test schedules
	now := time.Now()
	tomorrow := now.AddDate(0, 0, 1)
	dayAfterTomorrow := tomorrow.AddDate(0, 0, 1)
	nextWeek := now.AddDate(0, 0, 10) // More than 7 days
	
	schedules := []models.Schedule{
		{
			ID:        utils.GenerateID(),
			Title:     "Tomorrow",
			StartTime: tomorrow,
			EndTime:   tomorrow.Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
		{
			ID:        utils.GenerateID(),
			Title:     "Day After Tomorrow",
			StartTime: dayAfterTomorrow,
			EndTime:   dayAfterTomorrow.Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
		{
			ID:        utils.GenerateID(),
			Title:     "Next Week",
			StartTime: nextWeek,
			EndTime:   nextWeek.Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
	}

	for i := range schedules {
		err := repo.CreateSchedule(ctx, &schedules[i])
		assert.NoError(t, err)
	}

	// Get upcoming schedules (7 days)
	upcoming, err := service.GetUpcomingSchedules(ctx, 7)
	assert.NoError(t, err)
	assert.Len(t, upcoming, 2) // Tomorrow and Day After Tomorrow only
}

func TestScheduleService_UpdateScheduleStatus(t *testing.T) {
	db := setupScheduleTestDB(t)

	repo := repository.NewScheduleRepository(db)
	service := NewScheduleService(repo)

	// Create a test schedule
	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Test",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(2 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Status:    models.ScheduleStatusPlanned,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Update status
	err = service.UpdateScheduleStatus(context.Background(), schedule.ID, models.ScheduleStatusCompleted)
	assert.NoError(t, err)

	// Verify status update
	updated, err := repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.ScheduleStatusCompleted, updated.Status)
}

func TestIsValidScheduleType(t *testing.T) {
	tests := []struct {
		scheduleType models.ScheduleType
		wantValid    bool
	}{
		{models.ScheduleTypeDate, true},
		{models.ScheduleTypeWork, true},
		{models.ScheduleTypeFamily, true},
		{models.ScheduleTypeFriend, true},
		{models.ScheduleTypeOther, true},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(string(tt.scheduleType), func(t *testing.T) {
			got := isValidScheduleType(tt.scheduleType)
			assert.Equal(t, tt.wantValid, got)
		})
	}
}

func TestIsValidScheduleStatus(t *testing.T) {
	tests := []struct {
		status    models.ScheduleStatus
		wantValid bool
	}{
		{models.ScheduleStatusPlanned, true},
		{models.ScheduleStatusCompleted, true},
		{models.ScheduleStatusCancelled, true},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(string(tt.status), func(t *testing.T) {
			got := isValidScheduleStatus(tt.status)
			assert.Equal(t, tt.wantValid, got)
		})
	}
}

func TestIsValidReminderType(t *testing.T) {
	tests := []struct {
		reminder  models.ReminderType
		wantValid bool
	}{
		{models.ReminderTypeNone, true},
		{models.ReminderType1h, true},
		{models.ReminderType1d, true},
		{models.ReminderType1w, true},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(string(tt.reminder), func(t *testing.T) {
			got := isValidReminderType(tt.reminder)
			assert.Equal(t, tt.wantValid, got)
		})
	}
}

func TestParseParticipants(t *testing.T) {
	tests := []struct {
		name          string
		participants  string
		wantCount     int
		wantContains  []string
	}{
		{
			name:         "empty string",
			participants: "",
			wantCount:    0,
		},
		{
			name:          "valid JSON",
			participants:  `["user", "partner"]`,
			wantCount:     2,
			wantContains:  []string{"user", "partner"},
		},
		{
			name:          "invalid JSON returns default",
			participants:  "invalid",
			wantCount:     2,
			wantContains:  []string{"user", "partner"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseParticipants(tt.participants)
			assert.NoError(t, err)
			assert.Len(t, got, tt.wantCount)
			for _, want := range tt.wantContains {
				assert.Contains(t, got, want)
			}
		})
	}
}

func TestFormatParticipants(t *testing.T) {
	participants := []string{"user", "partner"}
	result, err := FormatParticipants(participants)
	assert.NoError(t, err)
	assert.Contains(t, result, "user")
	assert.Contains(t, result, "partner")
}
