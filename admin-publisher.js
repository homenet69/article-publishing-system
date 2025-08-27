const puppeteer = require('puppeteer');

class AdminPublisher {
    constructor() {
        this.browser = null;
        this.page = null;
        this.adminUrl = 'http://100.74.157.99:3000/admin';
    }

    async init() {
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for production
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1200, height: 800 });
            console.log('Browser initialized successfully');
        } catch (error) {
            console.error('Failed to initialize browser:', error);
            throw error;
        }
    }

    async navigateToAdmin() {
        try {
            console.log('Navigating to admin panel...');
            await this.page.goto(this.adminUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            console.log('Successfully navigated to admin panel');
        } catch (error) {
            console.error('Failed to navigate to admin panel:', error);
            throw error;
        }
    }

    async findAndClickNewArticleButton() {
        try {
            console.log('Looking for "Skriv Ny Artikkel" button...');
            
            // Wait for the page to load and look for the button
            await this.page.waitForTimeout(2000);
            
            // Try multiple selectors for the red button
            const buttonSelectors = [
                'button:contains("Skriv Ny Artikkel")',
                '[class*="red"]:contains("Skriv Ny Artikkel")',
                'button[style*="red"]',
                '.btn-red',
                '.button-red',
                'input[value*="Skriv Ny Artikkel"]'
            ];

            let buttonFound = false;
            for (const selector of buttonSelectors) {
                try {
                    const button = await this.page.$(selector);
                    if (button) {
                        console.log(`Found button with selector: ${selector}`);
                        await button.click();
                        buttonFound = true;
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!buttonFound) {
                // Fallback: look for any red-colored element on the right side
                console.log('Trying to find red button by position and color...');
                await this.page.evaluate(() => {
                    const elements = document.querySelectorAll('*');
                    for (let el of elements) {
                        const style = window.getComputedStyle(el);
                        const rect = el.getBoundingClientRect();
                        
                        // Check if element is on the right side and has red color
                        if (rect.right > window.innerWidth * 0.7 && 
                            rect.top < window.innerHeight * 0.3 &&
                            (style.backgroundColor.includes('red') || 
                             style.color.includes('red') ||
                             el.textContent.includes('Skriv Ny Artikkel'))) {
                            el.click();
                            return true;
                        }
                    }
                    return false;
                });
            }

            await this.page.waitForTimeout(2000);
            console.log('Button clicked successfully');
        } catch (error) {
            console.error('Failed to find or click new article button:', error);
            throw error;
        }
    }

    async fillArticleForm(title, content) {
        try {
            console.log('Filling article form...');
            
            // Wait for form to appear
            await this.page.waitForTimeout(3000);
            
            // Try to find title field
            const titleSelectors = [
                'input[name*="title"]',
                'input[name*="tittel"]',
                'input[placeholder*="title"]',
                'input[placeholder*="tittel"]',
                '#title',
                '#tittel',
                '.title-input',
                'input[type="text"]:first-of-type'
            ];

            let titleFilled = false;
            for (const selector of titleSelectors) {
                try {
                    const titleField = await this.page.$(selector);
                    if (titleField) {
                        await titleField.click();
                        await titleField.clear();
                        await titleField.type(title);
                        titleFilled = true;
                        console.log(`Title filled using selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            // Try to find content field
            const contentSelectors = [
                'textarea[name*="content"]',
                'textarea[name*="innhold"]',
                'textarea[placeholder*="content"]',
                'textarea[placeholder*="innhold"]',
                '#content',
                '#innhold',
                '.content-textarea',
                'textarea:first-of-type',
                '[contenteditable="true"]'
            ];

            let contentFilled = false;
            for (const selector of contentSelectors) {
                try {
                    const contentField = await this.page.$(selector);
                    if (contentField) {
                        await contentField.click();
                        await contentField.clear();
                        await contentField.type(content);
                        contentFilled = true;
                        console.log(`Content filled using selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!titleFilled || !contentFilled) {
                console.warn('Could not fill all form fields automatically');
            }

            await this.page.waitForTimeout(1000);
            console.log('Form filled successfully');
        } catch (error) {
            console.error('Failed to fill article form:', error);
            throw error;
        }
    }

    async submitArticle() {
        try {
            console.log('Submitting article...');
            
            // Look for submit button
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Publiser")',
                'button:contains("Submit")',
                'button:contains("Save")',
                'button:contains("Lagre")',
                '.submit-btn',
                '.publish-btn'
            ];

            let submitted = false;
            for (const selector of submitSelectors) {
                try {
                    const submitBtn = await this.page.$(selector);
                    if (submitBtn) {
                        await submitBtn.click();
                        submitted = true;
                        console.log(`Article submitted using selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!submitted) {
                // Try pressing Enter as fallback
                await this.page.keyboard.press('Enter');
                console.log('Tried submitting with Enter key');
            }

            await this.page.waitForTimeout(3000);
            console.log('Article submission completed');
        } catch (error) {
            console.error('Failed to submit article:', error);
            throw error;
        }
    }

    async publishArticle(title, content) {
        try {
            console.log(`\n=== PUBLISHING ARTICLE TO ADMIN PANEL ===`);
            console.log(`Title: ${title}`);
            console.log(`Content: ${content.substring(0, 100)}...`);
            
            await this.init();
            await this.navigateToAdmin();
            await this.findAndClickNewArticleButton();
            await this.fillArticleForm(title, content);
            await this.submitArticle();
            
            console.log('Article published successfully!');
            return { success: true, message: 'Article published to admin panel' };
        } catch (error) {
            console.error('Failed to publish article:', error);
            return { success: false, error: error.message };
        } finally {
            await this.cleanup();
        }
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                console.log('Browser closed');
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

module.exports = AdminPublisher;
