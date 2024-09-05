import { test, expect,Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
test.setTimeout(1000 * 60 * 10)
// Function to get the current date formatted as a string (YYYY-MM-DD)
function getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Function to get the current time formatted as a string
function getCurrentTime(): string {
    return new Date().toISOString().replace(/:/g, '-').slice(0, 19);
}

// Function to create a folder if it doesn't exist
function createFolder(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

// Function to take a full-page screenshot and save it to the correct folder
async function takeScreenshot(page: Page, folderPath: string, stepDescription: string, headerSelector: string): Promise<void> {
    // Move the header off-screen
    await page.evaluate((selector) => {
        const header = document.querySelector(selector) as HTMLElement;
        if (header) {
          header.style.visibility = 'hidden';
         
        }
    }, headerSelector);

    const fileName = `${stepDescription}_${getCurrentTime()}.png`;
    const filePath = path.join(folderPath, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
}

// Test to automate website navigation and take screenshots
test('Website Navigation and Screenshots', async ({ page }) => {
    // Set the default timeout to 5 minutes
    page.setDefaultTimeout(1000 * 60 * 5); // 5 min
    
    // Navigate to the website
    await page.goto('https://leyland-cypress-website.vercel.app/');

    // Selector for the fixed header element
    const headerSelector = 'nav'; // Replace with the actual selector of the header on your page

    // Create the folder structure
    const baseFolder = path.join(__dirname, getCurrentTime());
    createFolder(baseFolder);

    const sections = ['Homepage', 'What We Offer', 'ContactUs'];

    // Create folders for each section
    sections.forEach(section => {
        createFolder(path.join(baseFolder, section));
    });

    // Navigate to Homepage and take screenshots for Performance and Risk-Adjusted sections
    const homepageFolder = path.join(baseFolder, 'Homepage');

    // Button groups and their respective labels
    const buttonGroups = {
        'Performance': ['1M', '3M', '6M', 'ALL'],
        'Risk-Adjusted': ['1M', '3M', '6M', 'ALL']
    };

    // Loop through the button groups
    for (const [groupName, buttonLabels] of Object.entries(buttonGroups)) {
        const groupFolder = path.join(homepageFolder, groupName);
        createFolder(groupFolder);

        // Click the group button (Performance or Risk Adjusted)
        if (groupName === 'Risk-Adjusted'){
        await page.locator(`text=${groupName}`).last().click();
        }
        await page.waitForTimeout(20000); // Adjust timing as needed
        await takeScreenshot(page, groupFolder, `${groupName}-1W`, headerSelector);

        // Iterate through button labels and take screenshots
        for (const buttonText of buttonLabels) {
            await page.click(`button:has-text("${buttonText}")`);
            await page.waitForTimeout(20000); // Adjust timing as needed
            await takeScreenshot(page, groupFolder, `${groupName}-${buttonText}`, headerSelector);
        }
    }

    // Navigate to "What We Offer" and "Contact Us" sections (replace with actual navigation logic)
    // Take screenshots for each section
    const whatWeOfferFolder = path.join(baseFolder, 'What We Offer');
    const contactUsFolder = path.join(baseFolder, 'ContactUs');
    
    await page.goto('https://leyland-cypress-website.vercel.app/what-we-offer'); // Navigate to "What We Offer" section
    await page.waitForTimeout(20000); // Adjust timing as needed
    await takeScreenshot(page, whatWeOfferFolder, 'WhatWeOffer', headerSelector);

    await page.goto('https://leyland-cypress-website.vercel.app/contact'); // Navigate to "Contact Us" section
    await page.waitForTimeout(20000); // Adjust timing as needed
    await takeScreenshot(page, contactUsFolder, 'ContactUs', headerSelector);
});
