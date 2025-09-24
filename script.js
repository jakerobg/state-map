//floating tooltip
const tooltip = document.getElementById("tooltip");
const tooltipLabel = document.getElementById("tooltip-label");
const tooltipStats = document.getElementById("tooltip-stats");

const stateMap = new Map();
let pageData = [
  ["AL", false],
  ["AK", true],
  ["AZ", true],
  ["AR", false],
  ["CA", true],
  ["CO", true],
  ["CT", true],
  ["DE", false],
  ["DC", false],
  ["FL", true],
  ["GA", true],
  ["HI", true],
  ["ID", false],
  ["IL", false],
  ["IN", false],
  ["IA", false],
  ["KS", false],
  ["KY", false],
  ["LA", false],
  ["ME", false],
  ["MD", false],
  ["MA", true],
  ["MI", false],
  ["MN", false],
  ["MS", false],
  ["MO", false],
  ["MT", true],
  ["NE", false],
  ["NV", true],
  ["NH", true],
  ["NJ", false],
  ["NM", true],
  ["NY", true],
  ["NC", true],
  ["ND", false],
  ["OH", false],
  ["OK", false],
  ["OR", false],
  ["PA", false],
  ["RI", true],
  ["SC", false],
  ["SD", false],
  ["TN", false],
  ["TX", true],
  ["UT", true],
  ["VT", true],
  ["VA", true],
  ["WA", false],
  ["WV", false],
  ["WI", false],
  ["WY", false]
];

const filledColor = "#EAF2F6";
const unfilledColor = "rgba(250, 250, 250, 1)";

/**
 * fills each state based on percentage AND stores in state data
 */
async function stateFill() {
    const url = "https://edit.zoningatlas.org/atlas/status/summary/state/";
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        //same as await response - returned from fetch
        .then((data) => {

            data.forEach((state, index) => {
                const path = document.getElementById(state.abbreviation);
                if (path) {
                    //if state page (percentage > 0) use filledColor else unfilledColor
                    let fillColor = pageData[index][1] ? filledColor : unfilledColor;
                    
                    path.setAttribute("fill", fillColor);

                    const anchor = path.closest("a");
                    if (pageData[index][1]) {
                        const url = `https://www.zoningatlas.org/${state.state.toLowerCase()}`.replace(" ","-");
                        anchor.setAttribute("href", url);
                    }
                    else {
                        // remove any existing href for states with 0%
                        anchor.removeAttribute("href");
                        anchor.style.pointerEvents = "none"; // disable pointer events
                    }
                }
                else console.log("no path for ", state.abbreviation);

                // also populate fast lookup map
                stateMap.set(state.abbreviation, {state: state.state, percentage: state.percentage});
            });
        })
        .catch((error) => {
            console.error("can't fetch:", error);
        });
}

//SEARCHES STATE DATA FOR MATCHING STATE (slow but works)
// fast O(1) lookup by abbreviation using Map
function getState(abb) {
    const found = stateMap.get(abb);
    if (found) return found;

    // fallback: return a safe default while data is loading or missing
    return { state: "", percentage: 0, abbreviation: abb };
}

//TOOLTIP
document.querySelectorAll("svg path").forEach((path) => {
    path.addEventListener("mouseenter", (event) => {
        const state = getState(event.target.getAttribute("id"));
        tooltipLabel.textContent = state.state;
        tooltipStats.textContent = `${state.percentage}% finished`;

        tooltip.style.display = "block";
    });

    path.addEventListener("mousemove", (event) => {
        const offsetX = 10; // Distance from the cursor
        const offsetY = 10; // Distance from the cursor

        // tooltip pos
        let tooltipX = event.pageX + offsetX;
        let tooltipY = event.pageY + offsetY;

        // right side of the screen
        if (tooltipX + tooltip.offsetWidth > window.innerWidth - 20) {
            tooltipX = event.pageX - tooltip.offsetWidth - offsetX;
        }

        // bottom of the screen
        if (tooltipY + tooltip.offsetHeight > window.innerHeight - 10) {
            tooltipY = event.pageY - tooltip.offsetHeight - offsetY;
        }

        // Set the new position
        tooltip.style.left = tooltipX + "px";
        tooltip.style.top = tooltipY + "px";

        tooltip.style.display = "block";
    });

    path.addEventListener("mouseleave", () => {
        tooltip.style.display = "none"; // Hide tooltip
    });
});
