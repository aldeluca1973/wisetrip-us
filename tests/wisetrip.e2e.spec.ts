import { test, expect } from '@playwright/test';

test.describe('WiseTrip – Critical paths', () => {
  test('Auth → Onboarding → Inspire → Comparison → Sponsored rules', async ({ page }) => {
    await page.goto(process.env.APP_BASE_URL || 'https://ji1rydxf8129.space.minimax.io');

    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('qa+traveler@wisetrip.us');
    await page.getByLabel(/password/i).fill(process.env.QA_TRAVELER_PASSWORD!);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByText(/start planning/i).click();
    await page.getByLabel(/home airport/i).fill('SGF');
    await page.getByRole('button', { name: /save/i }).click();

    await page.getByRole('button', { name: /inspire me/i }).click();
    await expect(page.getByText(/From SGF/i)).toBeVisible();
    await expect(page.getByText(/Confidence \d{2}%/)).toBeVisible();

    const firstCard = page.locator('[data-testid="inspire-card"]').first();
    await expect(firstCard.getByText(/Sponsored/i)).toHaveCount(0);
    const cards = page.locator('[data-testid="inspire-card"]');
    const sponsored = page.locator('[data-testid="sponsored-badge"]');
    await expect(sponsored.count()).toBeGreaterThan(0);
    await expect((await cards.count()) / (await sponsored.count())).toBeGreaterThanOrEqual(4);

    await page.getByRole('tab', { name: /Flights/i }).click();
    await expect(page.getByTestId('result-card-flight').first()).toBeVisible();
    await page.getByRole('tab', { name: /Hotels/i }).click();
    await expect(page.getByTestId('result-card-hotel').first()).toBeVisible();
    await page.getByRole('tab', { name: /Airbnb/i }).click();
    await expect(page.getByTestId('result-card-airbnb').first()).toBeVisible();
    await page.getByRole('tab', { name: /Trains/i }).click();
    await expect(page.getByTestId('result-card-train').first()).toBeVisible();
  });

  test('RLS – non-collaborator cannot access private trip', async ({ page, context }) => {
    await page.goto(process.env.APP_BASE_URL!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('qa+traveler@wisetrip.us');
    await page.getByLabel(/password/i).fill(process.env.QA_TRAVELER_PASSWORD!);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /New Trip/i }).click();
    await page.getByLabel(/title/i).fill('RLS QA Trip');
    await page.getByRole('button', { name: /Create/i }).click();
    const tripId = page.url().split('/').pop()!;

    const page2 = await context.newPage();
    await page2.goto(process.env.APP_BASE_URL!);
    await page2.getByRole('button', { name: /sign in/i }).click();
    await page2.getByLabel(/email/i).fill('qa+collab@wisetrip.us');
    await page2.getByLabel(/password/i).fill(process.env.QA_COLLAB_PASSWORD!);
    await page.getByRole('button', { name: /continue/i }).click();
    await page2.goto(`${process.env.APP_BASE_URL}/trip/${tripId}`);
    await expect(page2.getByText(/not authorized|not found/i)).toBeVisible();
  });
});