async function takeScreenshot() {
    try {
        const button = document.querySelector('.screenshot-btn');
        const originalText = button.textContent;
        
        button.textContent = 'Taking Screenshot...';
        button.disabled = true;
        
        const response = await fetch('/screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: window.location.href
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Screenshot failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'pinterest-infographic-screenshot.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        button.textContent = 'Screenshot Downloaded!';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Error taking screenshot:', error);
        const button = document.querySelector('.screenshot-btn');
        button.textContent = `Error: ${error.message}`;
        button.disabled = false;
        setTimeout(() => {
            button.textContent = 'Take Screenshot';
        }, 3000);
    }
}