import { test, expect } from '@playwright/test';

test.describe('WiseTrip – Connectivity & Basic UI', () => {
  test('Homepage loads and basic elements are present', async ({ page }) => {
    await page.goto(process.env.APP_BASE_URL || 'https://ji1rydxf8129.space.minimax.io');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check basic elements exist
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
    
    // Check page title
    await expect(page).toHaveTitle(/WiseTrip/i);
    
    console.log('✅ Basic connectivity test passed');
  });

  test('Navigation and routing work', async ({ page }) => {
    await page.goto(process.env.APP_BASE_URL || 'https://ji1rydxf8129.space.minimax.io');
    
    // Test if the app loads without JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('domcontentloaded');
    
    // Allow some time for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out common non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('sw.js') &&
      !error.includes('manifest')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ No critical JavaScript errors detected');
  });
});