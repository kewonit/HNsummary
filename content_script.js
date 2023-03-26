    // Define custom error messages
    const ErrInternalServerError = new Error("Internal server error, please try again later.");
    const ErrBadRequest = new Error("We're sorry, but Hacker News Summarizer was unable to produce a summary for this article.");

    let OPENAI_API_KEY = localStorage.getItem("OPENAI_API_KEY");
    let max_tokens = localStorage.getItem("max_tokens");
    
    // If not found in localStorage, null, undefined or an empty string, prompt the user to input them
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "null" || OPENAI_API_KEY === "") {
        OPENAI_API_KEY = prompt("Please enter your OpenAI API key:");
        localStorage.setItem("OPENAI_API_KEY", OPENAI_API_KEY);
    }
    if (!max_tokens || max_tokens === "null" || max_tokens === "") {
        max_tokens = prompt("Please enter the max_tokens value:");
        localStorage.setItem("max_tokens", max_tokens);
    }

// Define the function to get summary from OpenAI API
const getSummaryFromAPI = async (url) => {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const prompt = `Summarize this article: ${url}`;
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: prompt}],
        max_tokens: parseInt(max_tokens),
        n: 1,
        stop: "\n"
    };
    
    // Send a POST request to OpenAI API and get response
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(data)
    });


    // Handle errors
    if (!response.ok) {
        if (response.status === 400) {
            throw ErrBadRequest;
        } else {
            throw ErrInternalServerError;
        }
    }
// Wait for the JSON response and return the summary
const json = await response.json();
if (json?.choices?.[0]?.message?.content) {
  const content = json.choices[0].message.content;
  return { content };
} else {
  throw ErrBadRequest;
}
};
    // Define the function to add "summary" links to each article
    const addSummarizeLinks = () => {
        const titleLines = document.querySelectorAll('.titleline');
        titleLines.forEach(titleLine => {
          const link = titleLine.querySelector('a');
          if (link) {
            const url = link.href;
            titleLine.innerHTML += `<span> |&nbsp;<a class="hn-summarizer--summary-link" href="#">summary</a></span>`;
            const summaryLink = titleLine.querySelector('.hn-summarizer--summary-link');
            summaryLink.addEventListener('click', async function(event) {
              event.preventDefault();
              toggleLinkText(summaryLink);
              const summaryFromStorage = getSummaryFromLocalStorage(url);
              if (summaryFromStorage) {
                showText(summaryFromStorage, url);
              } else {
                try {
                  const summary = await getSummaryFromAPI(url);
                  const message = summary.content;
                  showText(message, url);
                  localStorage.setItem(`hn-summarizer--summary-${url}`, JSON.stringify({
                    content: message,
                    timestamp: Date.now()
                  }));
                } catch (error) {
                  console.log(error);
                  showText(error.message, url);
                }
              }
            });
          }
        });
      };
      
      const getSummaryFromLocalStorage = (url) => {
        const summaryData = localStorage.getItem(`hn-summarizer--summary-${url}`);
        console.log(summaryData); // Add this line to print out the value of summaryData
        if (summaryData) {
          const { content, timestamp } = JSON.parse(summaryData);
          if (timestamp + 24 * 60 * 60 * 1000 > Date.now()) {
            return content;
          }
        }
        return null;
      };
      

    // This function toggles the link text of the summary/hide summary link
    const toggleLinkText = (target) => {
        if (target.innerText === "summary") {
            target.innerText = "";
        } else {
            target.innerText = "summary";
        }
    };

    // This function creates a new row for the summary
    const createSummaryRow = (url) => {
        const targetEl = document.querySelector(`a[href='${url}']`);
        const newElement = document.createElement("tr");
        newElement.innerHTML = `<td colspan="2"></td><td id="hn-summarizer--col-${url}"></td>`;
        // This inserts the new row after the original row containing the link
        targetEl.closest('tr').insertAdjacentElement("afterend", newElement);
    };

    // This function shows the text summary
    const showText = (text, url) => {
        const targetId = `hn-summarizer--col-${url}`;
        const targetEl = document.getElementById(targetId);
        const storageKey = `summary-${url}`;
        const storedSummary = localStorage.getItem(storageKey);
        if (targetEl) {
            // If the target element already exists, replace its inner HTML with the summary text
            targetEl.innerHTML = text;
            localStorage.setItem(storageKey, text);
        } else if (storedSummary) {
            // If the summary is stored in local storage, create a new row and insert the stored summary
            createSummaryRow(url);
            const newTargetEl = document.getElementById(targetId);
            newTargetEl.innerHTML = storedSummary;
        } else {
            // If the target element doesn't exist and the summary is not stored, create a new row and generate the summary
            createSummaryRow(url);
            const newTargetEl = document.getElementById(targetId);
            newTargetEl.innerHTML = text;
            localStorage.setItem(storageKey, text);
        }
    };
    

    addSummarizeLinks();
    
//CSS eh cause why not?
// Select the element
// Select all elements with class '.hn-summarizer--summary-link'
const myElements = document.querySelectorAll('.hn-summarizer--summary-link');

// Loop through all elements and apply the background color
myElements.forEach((element) => {
  element.style.fontSize = '9pt';
});