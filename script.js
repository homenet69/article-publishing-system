document.getElementById('checkButton').addEventListener('click', async function() {
    const url = document.getElementById('urlInput').value;
    const resultDiv = document.getElementById('result');

    if (!url) {
        resultDiv.innerHTML = '<p style="color: red;">Vennligst lim inn en URL.</p>';
        return;
    }

    resultDiv.innerHTML = '<p>Sender URL til AI-analyse...</p>';

    try {
        // Send URL til lokal server
        const response = await fetch('/faktasjekk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `
                <h2>Faktasjekk Status</h2>
                <p style="color: green;">${data.message}</p>
                <p><strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a></p>
                <p><em>AI-analysen utføres nå i VSCode-sesjonen. Resultatet vil vises her når det er klart.</em></p>
                <div id="ai-result" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #007bff;">
                    <p>Venter på MotStrømsMedia faktasjekk...</p>
                </div>
            `;
            
            // Poll for results
            pollForResults(url);
        } else {
            throw new Error(data.error || 'Ukjent feil');
        }

    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `
            <p style="color: red;">Det oppstod en feil: ${error.message}</p>
        `;
    }
});

async function pollForResults(url) {
    // This would poll for results in a real implementation
    // For now, it just shows the waiting message
    setTimeout(() => {
        const aiResultDiv = document.getElementById('ai-result');
        if (aiResultDiv) {
            aiResultDiv.innerHTML = `
                <h3>MotStrømsMedia Faktasjekk</h3>
                <p><strong>Analysert URL:</strong> ${url}</p>
                <p><em>AI-analysen pågår i VSCode-sesjonen. Resultatet vil bli vist her når det er ferdig.</em></p>
            `;
        }
    }, 2000);
}
