const API_BASE = "/api";

let hmiState = null;
let machinePoweredOn = false;


/* =========================================================
   APPLICATION START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("HMI application started");

    setupButtons();

    loadState();

    updatePowerButton();

});


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons() {

    console.log("Setting up HMI buttons...");

    document.addEventListener("click", async (event) => {

        const button = event.target.closest("button, .power");

        if (!button) {
            return;
        }

        /*
         * Ignore disabled buttons
         */
        if (button.disabled) {
            return;
        }

        const action = button.dataset.action;
        const id = button.dataset.id;

        try {

            /*
             * POWER BUTTON
             */
            if (
                action === "power-on" ||
                button.classList.contains("power")
            ) {

                togglePower();

                return;
            }


            /*
             * No action
             */
            if (!action) {
                return;
            }


            /*
             * ACTIONS
             */
            switch (action) {

                case "confirm-check":

                    await confirmMachineCheck(id);

                    break;


                case "confirm-tool":

                    await confirmTool(id);

                    break;


                case "confirm-workpiece":

                    await confirmWorkpiece(id);

                    break;


                case "next":

                    await nextStage();

                    break;


                case "start-operation":

                    console.log(
                        "START OPERATION BUTTON CLICKED"
                    );

                    await startOperation();

                    break;


                case "stop-operation":

                    console.log(
                        "STOP OPERATION BUTTON CLICKED"
                    );

                    await stopOperation();

                    break;


                default:

                    console.warn(
                        "Unknown button action:",
                        action
                    );
            }

        } catch (error) {

            console.error(
                "Button action failed:",
                error
            );

            showError(error.message);
        }

    });

}


/* =========================================================
   LOAD HMI STATE
   ========================================================= */

async function loadState() {

    console.log("Loading HMI state...");

    try {

        clearError();

        const response = await fetch(
            `${API_BASE}/state`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load HMI state. HTTP ${response.status}`
            );
        }


        hmiState = await response.json();


        console.log(
            "HMI STATE:",
            hmiState
        );


        console.log(
            "Current Stage:",
            hmiState.currentStage
        );


        renderHMI();


    } catch (error) {

        console.error(
            "Failed to load HMI state:",
            error
        );

        showError(error.message);
    }

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderHMI() {

    if (!hmiState) {
        return;
    }

    renderJob();

    renderCounts();

    renderSteps();

    renderStage();

    updatePowerButton();

}


/* =========================================================
   POWER BUTTON
   ========================================================= */

function togglePower() {

    if (machinePoweredOn) {

        /*
         * MACHINE OFF
         */

        machinePoweredOn = false;

        console.log(
            "Machine powered OFF"
        );

    } else {

        /*
         * MACHINE ON
         */

        machinePoweredOn = true;

        console.log(
            "Machine powered ON"
        );
    }


    updatePowerButton();


    /*
     * Re-render current section.
     *
     * This is important because
     * machine check buttons must become
     * enabled/disabled according to power state.
     */

    if (hmiState) {

        renderHMI();

    }

}


/* =========================================================
   UPDATE POWER BUTTON
   ========================================================= */

function updatePowerButton() {

    const powerElement =
        document.querySelector(".power");


    if (!powerElement) {

        console.warn(
            "POWER element '.power' not found"
        );

        return;
    }


    powerElement.style.cursor = "pointer";


    if (machinePoweredOn) {

        /*
         * POWER ON = GREEN
         */

        powerElement.textContent =
            "● POWER ON";

        powerElement.style.backgroundColor =
            "#20a653";

        powerElement.style.color =
            "white";

        powerElement.classList.remove(
            "power-off"
        );

        powerElement.classList.add(
            "power-on"
        );

    } else {

        /*
         * POWER OFF = RED
         */

        powerElement.textContent =
            "● POWER OFF";

        powerElement.style.backgroundColor =
            "#dc3545";

        powerElement.style.color =
            "white";

        powerElement.classList.remove(
            "power-on"
        );

        powerElement.classList.add(
            "power-off"
        );
    }

}


/* =========================================================
   JOB INFORMATION
   ========================================================= */

function renderJob() {

    const job = hmiState.job;


    if (!job) {
        return;
    }


    setText(
        "jobOperation",
        job.operationName
    );


    setText(
        "jobQuantity",
        job.quantity
    );


    setText(
        "jobMaterial",
        job.material
    );


    setText(
        "jobRevision",
        job.drawingRevision
    );


    setText(
        "jobProgram",
        job.cncProgram
    );


    setText(
        "jobFixture",
        job.fixture
    );


    setText(
        "jobOffset",
        job.workOffset
    );

}


/* =========================================================
   COUNTS
   ========================================================= */

function renderCounts() {

    const machineTotal =
        hmiState.machineChecks
            ? hmiState.machineChecks.length
            : 0;


    const toolTotal =
        hmiState.tools
            ? hmiState.tools.length
            : 0;


    const workpieceTotal =
        hmiState.workpieceSteps
            ? hmiState.workpieceSteps.length
            : 0;


    setText(
        "machineCount",
        `${hmiState.confirmedChecks} / ${machineTotal}`
    );


    setText(
        "toolCount",
        `${hmiState.confirmedTools} / ${toolTotal}`
    );


    setText(
        "workpieceCount",
        `${hmiState.confirmedWorkpiece} / ${workpieceTotal}`
    );


    setText(
        "readyMachineCount",
        `${hmiState.confirmedChecks}/${machineTotal}`
    );


    setText(
        "readyToolCount",
        `${hmiState.confirmedTools}/${toolTotal}`
    );


    setText(
        "readyWorkpieceCount",
        `${hmiState.confirmedWorkpiece}/${workpieceTotal}`
    );

}


/* =========================================================
   RENDER STAGE
   ========================================================= */

function renderStage() {

    if (!hmiState) {
        return;
    }


    const stage =
        hmiState.currentStage;


    console.log(
        "Rendering stage:",
        stage
    );


    /*
     * Hide all sections
     */

    hideSection("machineSection");

    hideSection("toolsSection");

    hideSection("workpieceSection");

    hideSection("readySection");

    hideSection("operationSection");


    /*
     * Show current stage
     */

    switch (stage) {

        case "MACHINE":

            showSection("machineSection");

            renderMachineChecks();

            break;


        case "TOOLS":

            showSection("toolsSection");

            renderTools();

            break;


        case "WORKPIECE":

            showSection("workpieceSection");

            renderWorkpiece();

            break;


        case "READY":

            showSection("readySection");

            renderReady();

            break;


        case "OPERATION":

            showSection("operationSection");

            renderOperation();

            break;


        default:

            console.warn(
                "Unknown current stage:",
                stage
            );
    }

}


/* =========================================================
   MACHINE CHECKS
   ========================================================= */

function renderMachineChecks() {

    const container =
        document.getElementById(
            "machineChecksContainer"
        );


    if (!container) {

        console.error(
            "machineChecksContainer not found"
        );

        return;
    }


    container.innerHTML = "";


    const checks =
        hmiState.machineChecks || [];


    checks.forEach(check => {

        const item =
            document.createElement("div");


        item.className = "item";


        /*
         * Button text depends on:
         *
         * 1. Confirmed
         * 2. Machine power
         */

        let buttonText;

        if (check.confirmed) {

            buttonText = "CONFIRMED";

        } else if (!machinePoweredOn) {

            buttonText = "POWER ON MACHINE";

        } else {

            buttonText = "CONFIRM CHECK";

        }


        /*
         * Button disabled when:
         *
         * - Already confirmed
         * - Machine is OFF
         */

        const disabled =
            check.confirmed ||
            !machinePoweredOn;


        item.innerHTML = `

            <div class="item-content">

                <div class="item-title">

                    ${escapeHtml(
                        check.description
                    )}

                </div>


                <div class="item-status">

                    ${
                        check.confirmed
                            ? "CONFIRMED"
                            : machinePoweredOn
                                ? "NOT CONFIRMED"
                                : "MACHINE POWER OFF"
                    }

                </div>

            </div>


            <button

                class="${
                    check.confirmed
                        ? "confirmed-btn"
                        : "confirm-btn"
                }"

                data-action="confirm-check"

                data-id="${check.id}"

                ${disabled ? "disabled" : ""}

            >

                ${buttonText}

            </button>

        `;


        container.appendChild(item);

    });


    /*
     * Proceed to Tools
     */

    addNextButton(

        container,

        machinePoweredOn &&
        allConfirmed(checks),

        "Proceed to Tools"

    );

}


/* =========================================================
   TOOLS
   ========================================================= */

function renderTools() {

    const container =
        document.getElementById(
            "toolsContainer"
        );


    if (!container) {

        console.error(
            "toolsContainer not found"
        );

        return;
    }


    container.innerHTML = "";


    const tools =
        hmiState.tools || [];


    tools.forEach(tool => {

        const item =
            document.createElement("div");


        item.className = "item";


        item.innerHTML = `

            <div class="item-content">

                <div class="item-title">

                    ${escapeHtml(
                        tool.toolNumber
                    )}

                    -

                    ${escapeHtml(
                        tool.toolType
                    )}

                </div>


                <div class="item-description">

                    Purpose:

                    ${escapeHtml(
                        tool.purpose
                    )}

                </div>


                <div class="item-status">

                    ${
                        tool.confirmed
                            ? "CONFIRMED"
                            : "NOT CONFIRMED"
                    }

                </div>

            </div>


            <button

                class="${
                    tool.confirmed
                        ? "confirmed-btn"
                        : "confirm-btn"
                }"

                data-action="confirm-tool"

                data-id="${tool.id}"

                ${tool.confirmed ? "disabled" : ""}

            >

                ${
                    tool.confirmed
                        ? "CONFIRMED"
                        : "CONFIRM TOOL"
                }

            </button>

        `;


        container.appendChild(item);

    });


    /*
     * Proceed to Workpiece
     */

    addNextButton(

        container,

        machinePoweredOn &&
        allConfirmed(tools),

        "Proceed to Workpiece"

    );

}


/* =========================================================
   WORKPIECE
   ========================================================= */

function renderWorkpiece() {

    const container =
        document.getElementById(
            "workpieceContainer"
        );


    if (!container) {

        console.error(
            "workpieceContainer not found"
        );

        return;
    }


    container.innerHTML = "";


    const steps =
        hmiState.workpieceSteps || [];


    steps.forEach(step => {

        const item =
            document.createElement("div");


        item.className = "item";


        item.innerHTML = `

            <div class="item-content">

                <div class="item-title">

                    Step ${step.sequenceNo}

                </div>


                <div class="item-description">

                    ${escapeHtml(
                        step.instruction
                    )}

                </div>


                <div class="item-status">

                    ${
                        step.confirmed
                            ? "CONFIRMED"
                            : "NOT CONFIRMED"
                    }

                </div>

            </div>


            <button

                class="${
                    step.confirmed
                        ? "confirmed-btn"
                        : "confirm-btn"
                }"

                data-action="confirm-workpiece"

                data-id="${step.id}"

                ${step.confirmed ? "disabled" : ""}

            >

                ${
                    step.confirmed
                        ? "CONFIRMED"
                        : "CONFIRM SETUP"
                }

            </button>

        `;


        container.appendChild(item);

    });


    /*
     * Proceed to Ready
     */

    addNextButton(

        container,

        machinePoweredOn &&
        allConfirmed(steps),

        "Proceed to Ready"

    );

}


/* =========================================================
   READY
   ========================================================= */

function renderReady() {

    const readyStatus =
        document.getElementById(
            "readyStatus"
        );


    const readyMessage =
        document.getElementById(
            "readyMessage"
        );


    if (!readyStatus) {

        console.error(
            "readyStatus not found"
        );

        return;
    }


    const machineChecks =
        hmiState.machineChecks || [];


    const tools =
        hmiState.tools || [];


    const workpieceSteps =
        hmiState.workpieceSteps || [];


    const ready =
        machinePoweredOn &&
        allConfirmed(machineChecks) &&
        allConfirmed(tools) &&
        allConfirmed(workpieceSteps);


    if (ready) {

        readyStatus.textContent =
            "READY";


        if (readyMessage) {

            readyMessage.textContent =
                "All machine, tooling and workpiece checks are complete. Proceed to operation.";

        }

    } else {

        readyStatus.textContent =
            "NOT READY";


        if (readyMessage) {

            readyMessage.textContent =
                "Complete all setup requirements before starting.";

        }

    }


    /*
     * Remove old button
     */

    const oldButton =
        document.getElementById(
            "goToOperationBtn"
        );


    if (oldButton) {

        oldButton.remove();

    }


    /*
     * Create button only when ready
     */

    if (ready) {

        const button =
            document.createElement(
                "button"
            );


        button.id =
            "goToOperationBtn";


        button.className =
            "next-btn";


        button.textContent =
            "PROCEED TO OPERATION";


        button.dataset.action =
            "next";


        /*
         * Button is handled by setupButtons()
         */

        const readySection =
            document.getElementById(
                "readySection"
            );


        if (readySection) {

            const box =
                readySection.querySelector(
                    ".ready-box"
                );


            if (box) {

                box.appendChild(button);

            } else {

                readySection.appendChild(
                    button
                );

            }

        }

    }

}


/* =========================================================
   OPERATION
   ========================================================= */

function renderOperation() {

    const statusElement =
        document.getElementById(
            "operationStatus"
        );


    if (!statusElement) {

        console.error(
            "operationStatus not found"
        );

        return;
    }


    const status =
        hmiState.operationStatus ||
        "READY";


    statusElement.textContent =
        status;


    statusElement.classList.remove(
        "running",
        "stopped"
    );


    if (status === "RUNNING") {

        statusElement.classList.add(
            "running"
        );

    }


    if (status === "STOPPED") {

        statusElement.classList.add(
            "stopped"
        );

    }


    const startBtn =
        document.getElementById(
            "startOperationBtn"
        );


    const stopBtn =
        document.getElementById(
            "stopOperationBtn"
        );


    /*
     * START disabled when:
     *
     * - Operation already running
     * - Machine is OFF
     */

    if (startBtn) {

        startBtn.disabled =
            status === "RUNNING" ||
            !machinePoweredOn;

    }


    /*
     * STOP
     */

    if (stopBtn) {

        stopBtn.disabled = false;

    }

}


/* =========================================================
   SHOW OPERATION STAGE
   ========================================================= */

function showOperationStage() {

    console.log(
        "Opening operation stage"
    );


    hideSection("machineSection");

    hideSection("toolsSection");

    hideSection("workpieceSection");

    hideSection("readySection");


    showSection("operationSection");


    updateStepIndicator(5);


    renderOperation();

}


/* =========================================================
   START OPERATION
   ========================================================= */

async function startOperation() {

    console.log(
        "Starting operation..."
    );


    /*
     * All setup must be complete
     */

    if (!allSetupComplete()) {

        showError(
            "Complete all machine, tool and workpiece checks first."
        );

        return;
    }


    /*
     * Machine must be ON
     */

    if (!machinePoweredOn) {

        showError(
            "Please POWER ON the machine first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/operation/start`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        console.log(
            "Start response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to start operation"
            );

        }


        await loadState();


        /*
         * Keep operator on operation screen
         */

        showOperationStage();


        if (hmiState) {

            renderOperation();

        }


    } catch (error) {

        console.error(
            "Start operation failed:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   STOP OPERATION
   ========================================================= */

async function stopOperation() {

    console.log(
        "Stopping operation..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/operation/stop`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        console.log(
            "Stop response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to stop operation"
            );

        }


        await loadState();


        /*
         * Keep operator on operation screen
         */

        showOperationStage();


        renderOperation();


    } catch (error) {

        console.error(
            "Stop operation failed:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   CONFIRM MACHINE CHECK
   ========================================================= */

async function confirmMachineCheck(id) {

    /*
     * IMPORTANT:
     *
     * Machine must be ON.
     */

    if (!machinePoweredOn) {

        showError(
            "Please POWER ON the machine before performing machine checks."
        );

        return;
    }


    if (!id) {

        console.error(
            "Machine check ID missing"
        );

        return;
    }


    console.log(
        "Confirming machine check:",
        id
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/checks/${id}/confirm`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to confirm machine check"
            );

        }


        clearError();


        await loadState();


    } catch (error) {

        console.error(
            "Machine check failed:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   CONFIRM TOOL
   ========================================================= */

async function confirmTool(id) {

    /*
     * Machine must remain ON.
     */

    if (!machinePoweredOn) {

        showError(
            "Please POWER ON the machine first."
        );

        return;
    }


    if (!id) {

        console.error(
            "Tool ID missing"
        );

        return;
    }


    console.log(
        "Confirming tool:",
        id
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/tools/${id}/confirm`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to confirm tool"
            );

        }


        clearError();


        await loadState();


    } catch (error) {

        console.error(
            "Tool confirmation failed:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   CONFIRM WORKPIECE
   ========================================================= */

async function confirmWorkpiece(id) {

    /*
     * Machine must remain ON.
     */

    if (!machinePoweredOn) {

        showError(
            "Please POWER ON the machine first."
        );

        return;
    }


    if (!id) {

        console.error(
            "Workpiece ID missing"
        );

        return;
    }


    console.log(
        "Confirming workpiece:",
        id
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/workpiece/${id}/confirm`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to confirm workpiece"
            );

        }


        clearError();


        await loadState();


    } catch (error) {

        console.error(
            "Workpiece confirmation failed:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   NEXT STAGE
   ========================================================= */

async function nextStage() {

    console.log(
        "Next stage requested"
    );


    if (!hmiState) {

        await loadState();

    }


    if (!hmiState) {
        return;
    }


    const stage =
        hmiState.currentStage;


    console.log(
        "Next stage from:",
        stage
    );


    /*
     * MACHINE -> TOOLS
     */

    if (stage === "MACHINE") {

        if (!machinePoweredOn) {

            showError(
                "Please POWER ON the machine first."
            );

            return;
        }


        if (
            !allConfirmed(
                hmiState.machineChecks
            )
        ) {

            showError(
                "Confirm all machine checks first."
            );

            return;
        }


        console.log(
            "Moving MACHINE -> TOOLS"
        );


        hmiState.currentStage =
            "TOOLS";


        clearError();


        renderHMI();


        return;
    }


    /*
     * TOOLS -> WORKPIECE
     */

    if (stage === "TOOLS") {

        if (!machinePoweredOn) {

            showError(
                "Please POWER ON the machine first."
            );

            return;
        }


        if (
            !allConfirmed(
                hmiState.tools
            )
        ) {

            showError(
                "Confirm all required tools first."
            );

            return;
        }


        console.log(
            "Moving TOOLS -> WORKPIECE"
        );


        hmiState.currentStage =
            "WORKPIECE";


        clearError();


        renderHMI();


        return;
    }


    /*
     * WORKPIECE -> READY
     */

    if (stage === "WORKPIECE") {

        if (!machinePoweredOn) {

            showError(
                "Please POWER ON the machine first."
            );

            return;
        }


        if (
            !allConfirmed(
                hmiState.workpieceSteps
            )
        ) {

            showError(
                "Confirm all workpiece setup steps first."
            );

            return;
        }


        console.log(
            "Moving WORKPIECE -> READY"
        );


        hmiState.currentStage =
            "READY";


        clearError();


        renderHMI();


        return;
    }


    /*
     * READY -> OPERATION
     */

    if (stage === "READY") {

        if (!machinePoweredOn) {

            showError(
                "Please POWER ON the machine first."
            );

            return;
        }


        if (!allSetupComplete()) {

            showError(
                "Complete all machine, tool and workpiece checks first."
            );

            return;
        }


        console.log(
            "Moving READY -> OPERATION"
        );


        hmiState.currentStage =
            "OPERATION";


        clearError();


        renderHMI();


        return;
    }


    /*
     * OPERATION
     */

    if (stage === "OPERATION") {

        console.log(
            "Already in OPERATION stage"
        );


        showOperationStage();


        return;
    }

}


/* =========================================================
   CHECK ALL SETUP
   ========================================================= */

function allSetupComplete() {

    if (!hmiState) {

        return false;

    }


    return (

        machinePoweredOn &&

        allConfirmed(
            hmiState.machineChecks
        )

        &&

        allConfirmed(
            hmiState.tools
        )

        &&

        allConfirmed(
            hmiState.workpieceSteps
        )

    );

}


/* =========================================================
   ALL CONFIRMED
   ========================================================= */

function allConfirmed(items) {

    if (
        !items ||
        items.length === 0
    ) {

        return false;

    }


    return items.every(
        item =>
            item.confirmed === true
    );

}


/* =========================================================
   ADD NEXT BUTTON
   ========================================================= */

function addNextButton(
    container,
    enabled,
    text
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "next-wrapper";


    const button =
        document.createElement("button");


    button.className =
        "next-btn";


    button.dataset.action =
        "next";


    button.textContent =
        text;


    button.disabled =
        !enabled;


    wrapper.appendChild(
        button
    );


    container.appendChild(
        wrapper
    );

}


/* =========================================================
   STEP INDICATOR
   ========================================================= */

function updateStepIndicator(stepNumber) {

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const step =
            document.getElementById(
                `step${i}`
            );


        if (!step) {
            continue;
        }


        step.classList.remove(
            "active",
            "completed"
        );


        if (i < stepNumber) {

            step.classList.add(
                "completed"
            );

        } else if (
            i === stepNumber
        ) {

            step.classList.add(
                "active"
            );

        }

    }

}


/* =========================================================
   STEP RENDERING
   ========================================================= */

function renderSteps() {

    if (!hmiState) {
        return;
    }


    const stage =
        hmiState.currentStage;


    let stepNumber = 1;


    switch (stage) {

        case "MACHINE":

            stepNumber = 1;

            break;


        case "TOOLS":

            stepNumber = 2;

            break;


        case "WORKPIECE":

            stepNumber = 3;

            break;


        case "READY":

            stepNumber = 4;

            break;


        case "OPERATION":

            stepNumber = 5;

            break;


        default:

            stepNumber = 1;
    }


    updateStepIndicator(
        stepNumber
    );

}


/* =========================================================
   SECTION HELPERS
   ========================================================= */

function showSection(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.display =
            "block";

    }

}


function hideSection(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.display =
            "none";

    }

}


/* =========================================================
   DOM TEXT HELPER
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "-";

    }

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError(message) {

    const errorElement =
        document.getElementById(
            "errorMessage"
        );


    if (!errorElement) {

        console.error(
            "Error element not found:",
            message
        );

        return;
    }


    errorElement.textContent =
        message;


    errorElement.style.display =
        "block";

}


function clearError() {

    const errorElement =
        document.getElementById(
            "errorMessage"
        );


    if (!errorElement) {
        return;
    }


    errorElement.textContent =
        "";


    errorElement.style.display =
        "none";

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}