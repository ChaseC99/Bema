let viewerIframe = document.getElementById("entry-viewer-iframe");
let spinner = document.querySelector(".loading-spinner");
let allJudged = viewerIframe ? false : true;
let Slider = function({
    title,
    name,
    description,
    id,
    max,
    color,
    borderColor,
    leftLabel,
    rightLabel
}) {
    this.title = title;
    this.name = name;
    this.description = description;
    this.id = id;
    this.max = max;
    this.min = 0;
    this.value = max / 2;
    this.color = color;
    this.border = borderColor;
    this.leftLabel = leftLabel;
    this.rightLabel = rightLabel;
};
Slider.prototype.create = function() {
    let container = document.getElementById(this.id);
    let title = document.createElement("h3");
    title.textContent = this.title;
    let description = document.createElement("p");
    description.textContent = this.description;
    let leftLabel = document.createElement("span");
    leftLabel.style.float = "left";
    leftLabel.className = "label";
    let rightLabel = document.createElement("span");
    rightLabel.style.float = "right";
    rightLabel.className = "label";
    let leftLabelTxt = document.createTextNode(this.leftLabel);
    let rightLabelTxt = document.createTextNode(this.rightLabel);
    leftLabel.appendChild(leftLabelTxt);
    rightLabel.appendChild(rightLabelTxt);
    let slider = document.createElement("input");
    slider.className = "slider";
    slider.name = this.name;
    slider.type = "range";
    slider.min = this.min;
    slider.max = this.max;
    slider.value = this.value;
    slider.style.background = this.color;
    slider.style.border = "1px solid " + this.border;
    let currentValue = document.createElement("div");
    currentValue.className = "current-value";
    currentValue.style.left = slider.value * 10 + "%";
    currentValue.textContent = slider.value / 2;
    slider.oninput = function() {
        currentValue.style.left = slider.value * 10 + "%";
        currentValue.textContent = slider.value / 2;
    }
    let ticks = document.createElement("div");
    ticks.className = "sliderTicks";
    for (let i = this.min; i < this.max / 2 + 1; ++i) {
        let tickVal = document.createElement("div");
        tickVal.className = "tick tickBottom";
        tickVal.style.left = (i * this.max * 2) + "%";
        let vals = document.createTextNode(i);
        tickVal.appendChild(vals);
        ticks.appendChild(tickVal);
    }
    container.appendChild(title);
    container.appendChild(description)
    container.appendChild(leftLabel);
    container.appendChild(rightLabel);
    container.appendChild(currentValue);
    container.appendChild(slider);
    container.appendChild(ticks);
};

if (allJudged) {
    let avatars = document.querySelectorAll(".avatar-dancer");
    avatars.forEach(el => {
        el.style.marginBottom = Math.random()*200 + "px";
    });

    request("get", "/api/internal/contests/getCurrentContest", null, data => {
        let resultsLink = document.getElementById("results-page-link");
        resultsLink.setAttribute("href", "/results/" + data.currentContest.contest_id);
        console.log(resultsLink);
    });

    document.querySelector(".footer").setAttribute("style", "position: fixed; bottom: 0px; width: 100%;");
} else {
    viewerIframe.addEventListener("load", () => {
        viewerIframe.style.display = "block";
        spinner.style.display = "none";
    });

    // /internal/judging/criteria
    request("get", "/api/internal/judging/criteria", null, data => {
        if (!data.error) {
            let creativitySlider = new Slider({
                title: data.judging_criteria[0].criteria_name,
                name: "creativity",
                description: data.judging_criteria[0].criteria_description,
                id: "creativity-slider",
                max: 10,
                color: "#00a60e",
                borderColor: "#7ed320",
                leftLabel: "Unimaginative",
                rightLabel: "Inventive"
            });
            creativitySlider.create();
            let complexitySlider = new Slider({
                title: data.judging_criteria[1].criteria_name,
                name: "complexity",
                description: data.judging_criteria[1].criteria_description,
                id: "complexity-slider",
                max: 10,
                color: "#9059ff",
                borderColor: "#8e5bf4",
                leftLabel: "Basic",
                rightLabel: "Elaborate"
            });
            complexitySlider.create();
            let qualityCodeSlider = new Slider({
                title: data.judging_criteria[2].criteria_name,
                name: "quality_code",
                description: data.judging_criteria[2].criteria_description,
                id: "quality-code-slider",
                max: 10,
                color: "#ffb100",
                borderColor: "#fea839",
                leftLabel: "Poor",
                rightLabel: "Elegant"
            });
            qualityCodeSlider.create();
            let interpretationSlider = new Slider({
                title: data.judging_criteria[3].criteria_name,
                name: "interpretation",
                description: data.judging_criteria[3].criteria_description,
                id: "interpretation-slider",
                max: 10,
                color: "#fa50ae",
                borderColor: "#d0011b",
                leftLabel: "Unrelated",
                rightLabel: "Representative"
            });
            interpretationSlider.create();
        } else {
            displayError(data.error);
        }
    });
}

let submitEvaluation = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/judging/submit", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let flagEntry = (id) => {
    let body = {entry_id: id};
    request("put", "/api/internal/entries/flag", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
