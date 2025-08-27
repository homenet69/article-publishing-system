const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Endpoint for faktasjekking
app.post('/faktasjekk', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL mangler' });
        }

        // Send URL til bruker for AI-analyse
        console.log('\n=== FAKTASJEKK FORESPØRSEL ===');
        console.log('URL som skal analyseres:', url);
        console.log('\nVenter på AI-analyse...');
        console.log('Brukeren må nå utføre faktasjekk av denne URL-en.');
        
        // Returner midlertidig respons
        res.json({
            status: 'pending',
            message: 'URL mottatt. AI-analyse pågår...',
            url: url
        });

    } catch (error) {
        console.error('Feil:', error);
        res.status(500).json({ error: 'Serverfeil' });
    }
});

// Function to publish to MotStrømsMedia API
async function publishToMotstromsmedia(articleData) {
    try {
        const response = await fetch('http://100.74.157.99:3000/api/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: 'motstromsmedia-external-publish-key-2025',
                title: articleData.title,
                content: articleData.content, // HTML-formatert
                author: articleData.author || 'Blackbox AI',
                categories: articleData.categories || ['teknologi'],
                summary: articleData.summary,
                imageUrl: articleData.imageUrl
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('Artikkel publisert til MotStrømsMedia:', result.article.url);
            return { success: true, article: result.article };
        } else {
            console.error('Feil ved publisering til MotStrømsMedia:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Nettverksfeil ved publisering til MotStrømsMedia:', error);
        return { success: false, error: error.message };
    }
}

// Function to convert plain text to HTML
function convertToHTML(content) {
    // Split content into paragraphs and convert to HTML
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map(paragraph => {
        const trimmed = paragraph.trim();
        
        // Check if it looks like a heading (short line, possibly with numbers/bullets)
        if (trimmed.length < 100 && (
            trimmed.match(/^\d+\./) || // Numbered list
            trimmed.match(/^[A-ZÆØÅ]/) || // Starts with capital
            trimmed.includes(':') // Contains colon
        )) {
            return `<h3>${trimmed}</h3>`;
        }
        
        // Regular paragraph
        return `<p>${trimmed}</p>`;
    }).join('\n');
}

// New endpoint to publish articles
app.post('/publishArticle', async (req, res) => {
    try {
        const { 
            title, 
            content, 
            useMotstromsmedia = false,
            author,
            categories,
            summary,
            imageUrl
        } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Både tittel og innhold må fylles ut.' });
        }

        // Log the article
        console.log('\n=== NY ARTIKKEL PUBLISERT ===');
        console.log('Tittel:', title);
        console.log('Innhold:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));
        console.log('Publisert:', new Date().toLocaleString('no-NO'));
        console.log('Publiser til MotStrømsMedia:', useMotstromsmedia);
        
        let result = {
            message: 'Artikkelen har blitt publisert lokalt!',
            title: title,
            timestamp: new Date().toISOString()
        };

        // If requested, also publish to MotStrømsMedia
        if (useMotstromsmedia) {
            try {
                // Convert plain text content to HTML
                const htmlContent = convertToHTML(content);
                
                const articleData = {
                    title,
                    content: htmlContent,
                    author: author || 'Blackbox AI',
                    categories: categories || ['teknologi'],
                    summary: summary || title, // Use title as summary if not provided
                    imageUrl
                };
                
                const motstrømsResult = await publishToMotstromsmedia(articleData);
                
                if (motstrømsResult.success) {
                    result.message = 'Artikkelen har blitt publisert til MotStrømsMedia!';
                    result.motstrømsPublished = true;
                    result.articleUrl = `http://100.74.157.99:3000${motstrømsResult.article.url}`;
                    result.articleId = motstrømsResult.article.id;
                    result.readingTime = motstrømsResult.article.readingTime;
                } else {
                    result.message = 'Artikkelen ble publisert lokalt, men feilet på MotStrømsMedia.';
                    result.motstrømsError = motstrømsResult.error;
                }
            } catch (error) {
                console.error('MotStrømsMedia publishing error:', error);
                result.message = 'Artikkelen ble publisert lokalt, men MotStrømsMedia publisering feilet.';
                result.motstrømsError = error.message;
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Publiseringsfeil:', error);
        res.status(500).json({ error: 'Serverfeil ved publisering av artikkelen.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
    console.log(`Faktasjekk: http://localhost:${PORT}`);
    console.log(`Publiser artikkel: http://localhost:${PORT}/publish.html`);
    console.log(`MotStrømsMedia API: http://100.74.157.99:3000/api/publish`);
});
