// Show/hide advanced options when MotStrømsMedia checkbox is toggled
document.getElementById('useMotstromsmedia').addEventListener('change', function() {
    const advancedOptions = document.getElementById('advancedOptions');
    if (this.checked) {
        advancedOptions.style.display = 'block';
    } else {
        advancedOptions.style.display = 'none';
    }
});

// Get selected categories as array
function getSelectedCategories() {
    const select = document.getElementById('categories');
    const selected = [];
    for (let option of select.options) {
        if (option.selected) {
            selected.push(option.value);
        }
    }
    return selected.length > 0 ? selected : ['teknologi']; // Default to teknologi
}

document.getElementById('publishForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const useMotstromsmedia = document.getElementById('useMotstromsmedia').checked;
    const author = document.getElementById('author').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const categories = getSelectedCategories();
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const resultDiv = document.getElementById('publishResult');

    // Basic front-end validations
    if (!title || !content) {
        resultDiv.innerHTML = '<p style="color: red;">Vennligst fyll ut både tittel og innhold.</p>';
        return;
    }

    // Show loading message
    const loadingMessage = useMotstromsmedia 
        ? '<p>Artikkelen publiseres til MotStrømsMedia, vennligst vent...</p>'
        : '<p>Artikkelen publiseres lokalt, vennligst vent...</p>';
    
    resultDiv.innerHTML = loadingMessage;

    try {
        const requestBody = {
            title,
            content,
            useMotstromsmedia
        };

        // Add optional fields if provided
        if (author) requestBody.author = author;
        if (summary) requestBody.summary = summary;
        if (categories.length > 0) requestBody.categories = categories;
        if (imageUrl) requestBody.imageUrl = imageUrl;

        const response = await fetch('/publishArticle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
            let resultHtml = `<p style="color: green;">${data.message}</p>`;
            
            if (data.motstrømsPublished) {
                resultHtml += '<p style="color: blue;">✓ Artikkelen ble publisert til MotStrømsMedia!</p>';
                if (data.articleUrl) {
                    resultHtml += `<p><strong>Artikkel-URL:</strong> <a href="${data.articleUrl}" target="_blank">${data.articleUrl}</a></p>`;
                }
                if (data.readingTime) {
                    resultHtml += `<p><strong>Lesetid:</strong> ${data.readingTime} minutter</p>`;
                }
            }
            
            if (data.motstrømsError) {
                resultHtml += `<p style="color: orange;">⚠ MotStrømsMedia feil: ${data.motstrømsError}</p>`;
            }
            
            resultHtml += `<p><small>Publisert: ${new Date(data.timestamp).toLocaleString('no-NO')}</small></p>`;
            
            resultDiv.innerHTML = resultHtml;
            
            // Clear fields after successful publishing
            document.getElementById('publishForm').reset();
            // Hide advanced options after reset
            document.getElementById('advancedOptions').style.display = 'none';
        } else {
            throw new Error(data.error || 'Ukjent feil ved publisering');
        }
    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `<p style="color: red;">Det oppstod en feil: ${error.message}</p>`;
    }
});
