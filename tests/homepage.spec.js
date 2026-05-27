// @ts-check
const { test, expect } = require('@playwright/test');

// ─── Homepage loads ───────────────────────────────────────────────────────────
test.describe('Homepage', () => {

  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Guy Hazak/);
  });

  test('hero headline is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-headline')).toBeVisible();
    await expect(page.locator('.home-headline')).toContainText('Building brands');
  });

  test('"See my work" button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.btn-primary', { hasText: 'See my work' })).toBeVisible();
  });

  test('no horizontal overflow (mobile)', async ({ page }) => {
    await page.goto('/');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 393;
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('hero has no redundant Download CV button', async ({ page }) => {
    await page.goto('/');
    // Only one CTA in the hero — "See my work"
    const heroCVBtn = page.locator('#home .btn-secondary');
    await expect(heroCVBtn).toHaveCount(0);
  });

  test('hero tag has no pill badge background (clean label)', async ({ page }) => {
    await page.goto('/');
    const tag = page.locator('.home-tag');
    await expect(tag).toBeVisible();
    // Should be plain text, no background colour set via inline style
    const bg = await tag.evaluate(el => getComputedStyle(el).backgroundColor);
    // transparent = rgba(0,0,0,0)
    expect(bg).toBe('rgba(0, 0, 0, 0)');
  });

});

// ─── Navigation ───────────────────────────────────────────────────────────────
test.describe('Navigation', () => {

  test('nav logo is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-logo')).toBeVisible();
    await expect(page.locator('.nav-logo')).toContainText('Guy Hazak');
  });

  test('desktop nav contains all links', async ({ page, viewport }) => {
    // Only run on desktop viewport
    if ((viewport?.width ?? 0) < 900) test.skip();
    await page.goto('/');
    const links = ['Home', 'My Works', 'About', 'Education', 'Resume', 'Contact'];
    for (const link of links) {
      await expect(page.locator('.nav-links a', { hasText: link })).toBeVisible();
    }
  });

  test('mobile hamburger menu opens and closes', async ({ page, viewport }) => {
    if ((viewport?.width ?? 1280) >= 900) test.skip();
    await page.goto('/');
    const toggle = page.locator('#nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('.nav-links')).toHaveClass(/open/);
    await toggle.click();
    await expect(page.locator('.nav-links')).not.toHaveClass(/open/);
  });

});

// ─── Sections present ─────────────────────────────────────────────────────────
test.describe('Page sections', () => {

  test('My Works section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#works')).toBeAttached();
  });

  test('Education section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#education')).toBeAttached();
  });

  test('"Beyond the resume" section appears after Education', async ({ page }) => {
    await page.goto('/');
    const eduTop = await page.locator('#education').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
    const aboutTop = await page.locator('#about').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
    expect(aboutTop).toBeGreaterThan(eduTop);
  });

  test('Resume section shows only download button (no CV preview)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cv .cv-preview')).toBeHidden();
    await expect(page.locator('#cv a.btn-primary', { hasText: 'Download my full CV' })).toBeVisible();
  });

  test('Resume section title reads "Resume"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cv .section-title')).toContainText('Resume');
  });

  test('Contact section exists with email', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contact')).toBeAttached();
    await expect(page.locator('.contact-email')).toContainText('guy.hazak@gmail.com');
  });

});

// ─── Work detail pages ────────────────────────────────────────────────────────
test.describe('Work detail pages', () => {

  test('clicking a work card opens the detail page (no contact bleed)', async ({ page }) => {
    await page.goto('/');
    // Click the first work card
    await page.locator('.work-card').first().click();
    // Contact section must NOT be visible
    await expect(page.locator('#contact')).toBeHidden();
    // Work detail content must appear
    await expect(page.locator('.work-detail-page')).toBeVisible();
  });

  test('"Back to all works" returns to main site', async ({ page }) => {
    await page.goto('/');
    await page.locator('.work-card').first().click();
    await page.locator('.work-back').click();
    await expect(page.locator('#main-site')).toBeVisible();
  });

  test('nav stays visible on work detail page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.work-card').first().click();
    await expect(page.locator('.work-detail-page')).toBeVisible();
    await expect(page.locator('.nav-logo')).toBeVisible();
  });

  test('works section has single header "Selected Work"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#works .section-title')).toContainText('Selected Work');
    // No redundant eyebrow above the section title
    await expect(page.locator('#works .section-eyebrow')).toHaveCount(0);
    // Exactly one category label: "Community & Projects" above Lounge/Shoval
    await expect(page.locator('.works-category-label')).toHaveCount(1);
    await expect(page.locator('.works-category-label')).toContainText('Community & Projects');
  });

  test('contact section has no double header', async ({ page }) => {
    await page.goto('/');
    // Only one heading — no eyebrow above "Contact"
    const contactSection = page.locator('#contact');
    await expect(contactSection.locator('.section-eyebrow')).toHaveCount(0);
    await expect(contactSection.locator('.section-title')).toContainText('Contact');
  });

});
