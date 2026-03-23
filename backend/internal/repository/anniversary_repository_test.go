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

func setupAnniversaryRepoTestDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(&models.Anniversary{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func TestAnniversaryRepository_CreateAnniversary(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)

	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "恋爱纪念日",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
		IsLunar: false,
	}

	err = repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)
	assert.NotEmpty(t, anniversary.ID)
}

func TestAnniversaryRepository_GetAnniversaryByID(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)

	// Create test anniversary
	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "Test",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
	}
	err = repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Get by ID
	found, err := repo.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.NoError(t, err)
	assert.Equal(t, anniversary.ID, found.ID)
	assert.Equal(t, "Test", found.Name)

	// Get non-existent
	_, err = repo.GetAnniversaryByID(context.Background(), "non-existent")
	assert.Error(t, err)
}

func TestAnniversaryRepository_GetAnniversaries(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)
	ctx := context.Background()

	// Create test anniversaries
	anniversaries := []models.Anniversary{
		{
			ID:      utils.GenerateID(),
			Name:    "恋爱纪念日",
			Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
			Icon:    "💕",
			Type:    models.AnniversaryTypeRelationship,
			Year:    2025,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "生日",
			Date:    time.Date(1995, 6, 15, 0, 0, 0, 0, time.Local),
			Icon:    "🎂",
			Type:    models.AnniversaryTypeBirthday,
			Year:    1995,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "春节",
			Date:    time.Date(2025, 1, 29, 0, 0, 0, 0, time.Local),
			Icon:    "🎉",
			Type:    models.AnniversaryTypeFestival,
			Year:    2025,
		},
	}

	for i := range anniversaries {
		err = repo.CreateAnniversary(ctx, &anniversaries[i])
		assert.NoError(t, err)
	}

	// Test get all
	all, err := repo.GetAnniversaries(ctx, nil)
	assert.NoError(t, err)
	assert.Len(t, all, 3)

	// Test filter by type
	annType := models.AnniversaryTypeRelationship
	relationship, err := repo.GetAnniversaries(ctx, &annType)
	assert.NoError(t, err)
	assert.Len(t, relationship, 1)
}

func TestAnniversaryRepository_GetUpcomingAnniversaries(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)
	ctx := context.Background()

	now := time.Now()
	anniversaries := []models.Anniversary{
		{
			ID:      utils.GenerateID(),
			Name:    "Next Week",
			Date:    now.AddDate(0, 0, 7),
			Icon:    "💕",
			Type:    models.AnniversaryTypeRelationship,
			Year:    now.Year(),
		},
		{
			ID:      utils.GenerateID(),
			Name:    "Next Month",
			Date:    now.AddDate(0, 1, 0),
			Icon:    "🎂",
			Type:    models.AnniversaryTypeBirthday,
			Year:    now.Year() - 1,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "Next Year",
			Date:    now.AddDate(1, 0, 0),
			Icon:    "🎉",
			Type:    models.AnniversaryTypeFestival,
			Year:    now.Year() - 1,
		},
	}

	for i := range anniversaries {
		err = repo.CreateAnniversary(ctx, &anniversaries[i])
		assert.NoError(t, err)
	}

	// Get upcoming (30 days)
	upcoming, err := repo.GetUpcomingAnniversaries(ctx, 30)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(upcoming), 1)
}

func TestAnniversaryRepository_UpdateAnniversary(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)

	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "Original",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
	}
	err = repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Update
	anniversary.Name = "Updated"
	err = repo.UpdateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Verify
	found, err := repo.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Updated", found.Name)
}

func TestAnniversaryRepository_DeleteAnniversary(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)

	anniversary := &models.Anniversary{
		ID:      utils.GenerateID(),
		Name:    "To Delete",
		Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
		Icon:    "💕",
		Type:    models.AnniversaryTypeRelationship,
		Year:    2025,
	}
	err = repo.CreateAnniversary(context.Background(), anniversary)
	assert.NoError(t, err)

	// Delete
	err = repo.DeleteAnniversary(context.Background(), anniversary.ID)
	assert.NoError(t, err)

	// Verify (should not find due to soft delete)
	_, err = repo.GetAnniversaryByID(context.Background(), anniversary.ID)
	assert.Error(t, err)
}

func TestAnniversaryRepository_GetRelationshipAnniversaries(t *testing.T) {
	db, err := setupAnniversaryRepoTestDB()
	assert.NoError(t, err)

	repo := NewAnniversaryRepository(db)
	ctx := context.Background()

	// Create test anniversaries
	anniversaries := []models.Anniversary{
		{
			ID:      utils.GenerateID(),
			Name:    "恋爱纪念日",
			Date:    time.Date(2025, 3, 14, 0, 0, 0, 0, time.Local),
			Icon:    "💕",
			Type:    models.AnniversaryTypeRelationship,
			Year:    2025,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "同居纪念日",
			Date:    time.Date(2025, 9, 1, 0, 0, 0, 0, time.Local),
			Icon:    "🏠",
			Type:    models.AnniversaryTypeRelationship,
			Year:    2025,
		},
		{
			ID:      utils.GenerateID(),
			Name:    "生日",
			Date:    time.Date(1995, 6, 15, 0, 0, 0, 0, time.Local),
			Icon:    "🎂",
			Type:    models.AnniversaryTypeBirthday,
			Year:    1995,
		},
	}

	for i := range anniversaries {
		err = repo.CreateAnniversary(ctx, &anniversaries[i])
		assert.NoError(t, err)
	}

	// Get relationship anniversaries
	relationship, err := repo.GetRelationshipAnniversaries(ctx)
	assert.NoError(t, err)
	assert.Len(t, relationship, 2)
}

func TestGetNextOccurrence(t *testing.T) {
	repo := &AnniversaryRepository{}
	now := time.Now()

	// Test anniversary date in the future this year
	futureDate := time.Date(now.Year(), 12, 25, 0, 0, 0, 0, time.Local)
	next := repo.getNextOccurrence(futureDate, now)
	assert.Equal(t, now.Year(), next.Year())
	assert.Equal(t, 12, int(next.Month()))
	assert.Equal(t, 25, next.Day())

	// Test anniversary date that passed this year
	pastDate := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.Local)
	next = repo.getNextOccurrence(pastDate, now)
	assert.Equal(t, now.Year()+1, next.Year())
	assert.Equal(t, 1, int(next.Month()))
	assert.Equal(t, 1, next.Day())
}
