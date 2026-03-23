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

func setupAnniversaryTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Auto migrate models
	err = db.AutoMigrate(&models.Anniversary{})
	if err != nil {
		t.Fatalf("Failed to migrate models: %v", err)
	}

	return db
}

func TestAnniversaryService_CreateAnniversary(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	date := time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local)

	tests := []struct {
		name        string
		anniversary *models.Anniversary
		wantError   bool
	}{
		{
			name: "valid relationship anniversary",
			anniversary: &models.Anniversary{
				Name:    "恋爱纪念日",
				Date:    date,
				Icon:    "💕",
				Type:    models.AnniversaryTypeRelationship,
				Year:    2025,
				IsLunar: false,
			},
			wantError: false,
		},
		{
			name: "valid birthday anniversary",
			anniversary: &models.Anniversary{
				Name:    "他的生日",
				Date:    time.Date(1995, 6, 15, 0, 0, 0, 0, time.Local),
				Icon:    "🎂",
				Type:    models.AnniversaryTypeBirthday,
				Year:    1995,
				IsLunar: false,
			},
			wantError: false,
		},
		{
			name: "invalid anniversary type",
			anniversary: &models.Anniversary{
				Name:    "Test",
				Date:    date,
				Type:    "invalid",
				Year:    2025,
			},
			wantError: true,
		},
		{
			name: "year too old",
			anniversary: &models.Anniversary{
				Name:    "Test",
				Date:    date,
				Type:    models.AnniversaryTypeRelationship,
				Year:    1800,
			},
			wantError: true,
		},
		{
			name: "year in future",
			anniversary: &models.Anniversary{
				Name:    "Test",
				Date:    date,
				Type:    models.AnniversaryTypeRelationship,
				Year:    time.Now().Year() + 1,
			},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.CreateAnniversary(context.Background(), tt.anniversary)
			if tt.wantError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, tt.anniversary.ID)
			}
		})
	}
}

func TestAnniversaryService_GetAnniversaryByID(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	// Create a test anniversary
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "恋爱纪念日",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
		IsLunar: false,
	}
	err := repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Test get existing anniversary
	found, err := service.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.NoError(t, err)
	assert.Equal(t, anniversary.ID, found.ID)
	assert.Equal(t, "恋爱纪念日", found.Name)

	// Test get non-existing anniversary
	_, err = service.GetAnniversaryByID(context.Background(), "non-existent")
	assert.Error(t, err)
	assert.Equal(t, ErrAnniversaryNotFound, err)
}

func TestAnniversaryService_UpdateAnniversary(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	// Create a test anniversary
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "Original Name",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
		IsLunar: false,
	}
	err := repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Update the anniversary
	anniversary.Name = "Updated Name"
	err = service.UpdateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Verify update
	updated, err := repo.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Name", updated.Name)
}

func TestAnniversaryService_DeleteAnniversary(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	// Create a test anniversary
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "To Delete",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
	}
	err := repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Delete the anniversary
	err = service.DeleteAnniversary(context.Background(), anniversary.ID)
	assert.NoError(t, err)

	// Verify deletion (should return error or soft-deleted)
	_, err = repo.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.Error(t, err)
}

func TestAnniversaryService_GetUpcomingAnniversaries(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	ctx := context.Background()

	// Create test anniversaries
	now := time.Now()
	anniversaries := []models.Anniversary{
		{
			ID:      utils.GenerateID(),
			Name:    "Next Week",
			Date:    now.AddDate(0, 0, 7),
			Icon:    "💕",
			Type:    models.AnniversaryTypeRelationship,
			Year:    now.Year(),
			IsLunar: false,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "Next Month",
			Date:    now.AddDate(0, 1, 0),
			Icon:    "🎂",
			Type:    models.AnniversaryTypeBirthday,
			Year:    now.Year() - 1,
			IsLunar: false,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "Next Year",
			Date:    now.AddDate(1, 0, 0),
			Icon:    "🎉",
			Type:    models.AnniversaryTypeFestival,
			Year:    now.Year() - 1,
			IsLunar: false,
		},
	}

	for i := range anniversaries {
		err := repo.CreateAnniversary(ctx, &anniversaries[i])
		assert.NoError(t, err)
	}

	// Get upcoming anniversaries (30 days)
	upcoming, err := service.GetUpcomingAnniversaries(ctx, 30)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(upcoming), 1) // At least "Next Week"
}

func TestAnniversaryService_GetDaysTogether(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	ctx := context.Background()

	// Create a relationship anniversary (100 days ago)
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "恋爱纪念日",
		Date:    time.Now().AddDate(0, 0, -100),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    time.Now().Year(),
		IsLunar: false,
	}
	err := repo.CreateAnniversary(ctx, anniversary)
	assert.NoError(t, err)

	// Get days together
	days, err := service.GetDaysTogether(ctx)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, days, 99) // Approximately 100 days
	assert.LessOrEqual(t, days, 101)
}

func TestAnniversaryService_GetAnniversaryInfo(t *testing.T) {
	db := setupAnniversaryTestDB(t)

	repo := repository.NewAnniversaryRepository(db)
	service := NewAnniversaryService(repo)

	// Create a test anniversary
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "恋爱纪念日",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
		IsLunar: false,
	}
	err := repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Get anniversary info
	info, err := service.GetAnniversaryInfo(context.Background(), anniversary.ID)
	assert.NoError(t, err)
	assert.Equal(t, anniversary.ID, info["id"])
	assert.Equal(t, "恋爱纪念日", info["name"])
	assert.NotNil(t, info["daysUntil"])
	assert.NotNil(t, info["years"])
}

func TestDaysTogether(t *testing.T) {
	// Test with a date 100 days ago
	startDate := time.Now().AddDate(0, 0, -100)
	days := DaysTogether(startDate)
	assert.GreaterOrEqual(t, days, 99)
	assert.LessOrEqual(t, days, 101)
}

func TestDaysUntil(t *testing.T) {
	// Test with a date 30 days in the future
	targetDate := time.Now().AddDate(0, 0, 30)
	days := DaysUntil(targetDate)
	assert.GreaterOrEqual(t, days, 29)
	assert.LessOrEqual(t, days, 31)

	// Test with a past date (should return 0)
	pastDate := time.Now().AddDate(0, 0, -10)
	days = DaysUntil(pastDate)
	assert.Equal(t, 0, days)
}

func TestGetAnniversaryProgress(t *testing.T) {
	// Test with a date 6 months ago (approximately 50% progress)
	anniversaryDate := time.Now().AddDate(0, -6, 0)
	progress := GetAnniversaryProgress(anniversaryDate)
	assert.GreaterOrEqual(t, progress, 40.0)
	assert.LessOrEqual(t, progress, 60.0)
}

func TestIsValidAnniversaryType(t *testing.T) {
	tests := []struct {
		anniversaryType models.AnniversaryType
		wantValid       bool
	}{
		{models.AnniversaryTypeFestival, true},
		{models.AnniversaryTypeBirthday, true},
		{models.AnniversaryTypeRelationship, true},
		{models.AnniversaryTypeOther, true},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(string(tt.anniversaryType), func(t *testing.T) {
			got := isValidAnniversaryType(tt.anniversaryType)
			assert.Equal(t, tt.wantValid, got)
		})
	}
}

func TestParseReminderDays(t *testing.T) {
	tests := []struct {
		name         string
		reminderDays string
		wantCount    int
		wantContains []int
	}{
		{
			name:         "empty string",
			reminderDays: "",
			wantCount:    3,
			wantContains: []int{7, 3, 1},
		},
		{
			name:         "valid JSON",
			reminderDays: `[14, 7, 3, 1]`,
			wantCount:    4,
			wantContains: []int{14, 7, 3, 1},
		},
		{
			name:         "invalid JSON returns default",
			reminderDays: "invalid",
			wantCount:    3,
			wantContains: []int{7, 3, 1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseReminderDays(tt.reminderDays)
			assert.NoError(t, err)
			assert.Len(t, got, tt.wantCount)
			for _, want := range tt.wantContains {
				assert.Contains(t, got, want)
			}
		})
	}
}

func TestFormatReminderDays(t *testing.T) {
	reminderDays := []int{7, 3, 1}
	result, err := FormatReminderDays(reminderDays)
	assert.NoError(t, err)
	assert.Contains(t, result, "7")
	assert.Contains(t, result, "3")
	assert.Contains(t, result, "1")
}
