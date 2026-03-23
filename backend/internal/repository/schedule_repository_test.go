package repository

import (
	"context"
	"testing"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/pkg/utils"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupScheduleRepoTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	err = db.AutoMigrate(&models.Schedule{})
	if err != nil {
		t.Fatalf("Failed to migrate models: %v", err)
	}

	return db
}

func TestScheduleRepository_CreateSchedule(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)

	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Test Date",
		Icon:      "💕",
		StartTime: time.Now().Add(1 * time.Hour),
		EndTime:   time.Now().Add(3 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
		Status:    models.ScheduleStatusPlanned,
	}

	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)
	assert.NotEmpty(t, schedule.ID)
}

func TestScheduleRepository_GetScheduleByID(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)

	// Create test schedule
	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Test",
		StartTime: time.Now().Add(1 * time.Hour),
		EndTime:   time.Now().Add(3 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Get by ID
	found, err := repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, schedule.ID, found.ID)
	assert.Equal(t, "Test", found.Title)

	// Get non-existent
	_, err = repo.GetScheduleByID(context.Background(), "non-existent")
	assert.Error(t, err)
}

func TestScheduleRepository_GetSchedules(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)
	ctx := context.Background()

	// Create test schedules
	now := time.Now()
	schedules := []models.Schedule{
		{
			ID:        utils.GenerateID(),
			Title:     "Date 1",
			StartTime: now.Add(1 * time.Hour),
			EndTime:   now.Add(3 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
		{
			ID:        utils.GenerateID(),
			Title:     "Work 1",
			StartTime: now.AddDate(0, 0, 1),
			EndTime:   now.AddDate(0, 0, 1).Add(2 * time.Hour),
			Type:      models.ScheduleTypeWork,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
		{
			ID:        utils.GenerateID(),
			Title:     "Date 2",
			StartTime: now.AddDate(0, 0, 2),
			EndTime:   now.AddDate(0, 0, 2).Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusCompleted,
		},
	}

	for i := range schedules {
		err := repo.CreateSchedule(ctx, &schedules[i])
		assert.NoError(t, err)
	}

	// Test get all
	all, err := repo.GetSchedules(ctx, nil, nil, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, all, 3)

	// Test filter by status
	status := models.ScheduleStatusPlanned
	planned, err := repo.GetSchedules(ctx, &status, nil, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, planned, 2)

	// Test filter by type
	scheduleType := models.ScheduleTypeDate
	dates, err := repo.GetSchedules(ctx, nil, &scheduleType, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, dates, 2)
}

func TestScheduleRepository_GetUpcomingSchedules(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)
	ctx := context.Background()

	now := time.Now()
	tomorrow := now.AddDate(0, 0, 1).Add(1 * time.Hour)
	dayAfter := now.AddDate(0, 0, 2).Add(1 * time.Hour)
	nextMonth := now.AddDate(0, 1, 0)
	
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
			StartTime: dayAfter,
			EndTime:   dayAfter.Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
		{
			ID:        utils.GenerateID(),
			Title:     "Next Month",
			StartTime: nextMonth,
			EndTime:   nextMonth.Add(2 * time.Hour),
			Type:      models.ScheduleTypeDate,
			Reminder:  models.ReminderTypeNone,
			Status:    models.ScheduleStatusPlanned,
		},
	}

	for i := range schedules {
		err := repo.CreateSchedule(ctx, &schedules[i])
		assert.NoError(t, err)
	}

	// Get upcoming (7 days)
	upcoming, err := repo.GetUpcomingSchedules(ctx, 7)
	assert.NoError(t, err)
	assert.Len(t, upcoming, 2) // Tomorrow and Day After Tomorrow
}

func TestScheduleRepository_UpdateSchedule(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)

	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Original",
		StartTime: time.Now().Add(1 * time.Hour),
		EndTime:   time.Now().Add(3 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Update
	schedule.Title = "Updated"
	err = repo.UpdateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Verify
	found, err := repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated", found.Title)
}

func TestScheduleRepository_DeleteSchedule(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)

	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "To Delete",
		StartTime: time.Now().Add(1 * time.Hour),
		EndTime:   time.Now().Add(3 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Delete
	err = repo.DeleteSchedule(context.Background(), schedule.ID)
	assert.NoError(t, err)

	// Verify (should not find due to soft delete)
	_, err = repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.Error(t, err)
}

func TestScheduleRepository_UpdateScheduleStatus(t *testing.T) {
	db := setupScheduleRepoTestDB(t)
	repo := NewScheduleRepository(db)

	schedule := &models.Schedule{
		ID:        utils.GenerateID(),
		Title:     "Test",
		StartTime: time.Now().Add(1 * time.Hour),
		EndTime:   time.Now().Add(3 * time.Hour),
		Type:      models.ScheduleTypeDate,
		Reminder:  models.ReminderTypeNone,
		Status:    models.ScheduleStatusPlanned,
	}
	err := repo.CreateSchedule(context.Background(), schedule)
	assert.NoError(t, err)

	// Update status
	err = repo.UpdateScheduleStatus(context.Background(), schedule.ID, models.ScheduleStatusCompleted)
	assert.NoError(t, err)

	// Verify
	found, err := repo.GetScheduleByID(context.Background(), schedule.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.ScheduleStatusCompleted, found.Status)
}
