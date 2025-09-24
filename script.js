//floating tooltip
const tooltip = document.getElementById("tooltip");
const tooltipLabel = document.getElementById("tooltip-label");
const tooltipStats = document.getElementById("tooltip-stats");

//storing state data
const stateData = [];
// fast lookup map keyed by state abbreviation for O(1) hover lookups
const stateMap = new Map();

const filledColor = "rgba(38, 142, 190, 1)";
const unfilledColor = "rgba(232, 232, 232, 1)";

/**
 * converts the percentage attribute to a rgb for CSS fill value based on start and end ranges
 */
function percentageToColor(percentage) {
    const diffRed = Math.round(252 + (0 - 249) * percentage * 0.01);
    const diffGreen = Math.round(252 + (104 - 249) * percentage * 0.01);
    const diffBlue = Math.round(252 + (154 - 249) * percentage * 0.01);
    return `rgb(${diffRed}, ${diffGreen}, ${diffBlue})`;
}

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
            data.forEach((state) => {
                const path = document.getElementById(state.abbreviation);
                if (path) {
                    //if state page (percentage > 0) use filledColor else unfilledColor
                    let fillColor = state.percentage > 0 ? filledColor : unfilledColor;
                    
                    path.setAttribute("fill", fillColor);

                    const anchor = path.closest("a");
                    if (state.percentage > 0) {
                        const url = `https://www.zoningatlas.org/${state.state.toLowerCase()}`.replace(" ","");
                        anchor.setAttribute("href", url);
                    }
                    else {
                        // remove any existing href for states with 0%
                        anchor.removeAttribute("href");
                        anchor.style.pointerEvents = "none"; // disable pointer events
                    }
                }

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

        //tooltip.style.display = "block";
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
