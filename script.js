const EPSILON = "ε";

let transitions = [];
let simulation = null;


/* ================= ADD TRANSITION ================= */

function addTransition(data = {}) {

    const table = document.getElementById("transitionTable");

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <input class="currentState"
            value="${data.current || ""}"
            placeholder="q0">
        </td>

        <td>
            <input class="inputSymbol"
            value="${data.input || ""}"
            placeholder="a or ε">
        </td>

        <td>
            <input class="stackSymbol"
            value="${data.stackTop || ""}"
            placeholder="Z0">
        </td>

        <td>
            <input class="nextState"
            value="${data.next || ""}"
            placeholder="q1">
        </td>

        <td>
            <input class="replacement"
            value="${data.replace || ""}"
            placeholder="A,Z0 or ε">
        </td>

        <td>
            <button class="delete-btn"
onclick="this.parentElement.parentElement.remove(); renderTransitionDiagram();">
    Delete
</button>
        </td>
    `;

    table.appendChild(row);

    renderTransitionDiagram();
}


/* ================= GET MACHINE ================= */

function getMachine() {

    const Q = document.getElementById("states").value
        .split(",")
        .map(x => x.trim())
        .filter(x => x);

    const Sigma = document.getElementById("alphabet").value
        .split(",")
        .map(x => x.trim())
        .filter(x => x);

    const Gamma = document.getElementById("stackAlphabet").value
        .split(",")
        .map(x => x.trim())
        .filter(x => x);

    const q0 =
        document.getElementById("startState").value.trim();

    const Z0 =
        document.getElementById("initialStack").value.trim();

    const F =
        document.getElementById("finalStates").value
            .split(",")
            .map(x => x.trim())
            .filter(x => x);

    const rows =
        document.querySelectorAll("#transitionTable tr");

    const transitionList = [];

    rows.forEach(row => {

        const current =
            row.querySelector(".currentState").value.trim();

        let input =
            row.querySelector(".inputSymbol").value.trim();

        const stackTop =
            row.querySelector(".stackSymbol").value.trim();

        const next =
            row.querySelector(".nextState").value.trim();

        let replace =
            row.querySelector(".replacement").value.trim();

        if (input === "") input = EPSILON;

        if (input === "eps" || input === "epsilon") {
            input = EPSILON;
        }

        let replacement = [];

        if (
            replace !== "" &&
            replace !== EPSILON &&
            replace !== "eps"
        ) {

            replacement = replace
                .split(",")
                .map(x => x.trim())
                .filter(x => x);
        }

        if (current && stackTop && next) {

            transitionList.push({

                current,
                input,
                stackTop,
                next,
                replacement

            });
        }

    });

    return {
        Q,
        Sigma,
        Gamma,
        q0,
        Z0,
        F,
        transitions: transitionList
    };
}
/* =========================================================
   TRANSITION DIAGRAM
   ========================================================= */

function renderTransitionDiagram() {

    const svg =
        document.getElementById("transitionDiagram");

    const edgesGroup =
        document.getElementById("diagramEdges");

    const statesGroup =
        document.getElementById("diagramStates");

    if (!svg || !edgesGroup || !statesGroup) {
        return;
    }

    const machine = getMachine();

    edgesGroup.innerHTML = "";
    statesGroup.innerHTML = "";

    const states = machine.Q;

    if (states.length === 0) {

        statesGroup.innerHTML = `
            <text
                x="550"
                y="230"
                class="diagram-empty">
                Add states to generate the transition diagram.
            </text>
        `;

        return;
    }

    /*
        Calculate state positions.

        For normal university examples, a horizontal
        arrangement looks the cleanest.
    */

    const positions = {};

    const width = 1100;
    const height = 460;

    const leftSpace = 150;
    const rightSpace = 120;

    const usableWidth =
        width - leftSpace - rightSpace;

    const spacing =
        states.length === 1
            ? 0
            : usableWidth / (states.length - 1);

    states.forEach((state, index) => {

        let x;

        if (states.length === 1) {
            x = width / 2;
        } else {
            x =
                leftSpace +
                spacing * index;
        }

        positions[state] = {
            x: x,
            y: height / 2
        };

    });


    /* =========================================
       DRAW START ARROW
       ========================================= */

    if (machine.q0 && positions[machine.q0]) {

        const start =
            positions[machine.q0];

        const startX =
            start.x - 95;

        const endX =
            start.x - 42;

        edgesGroup.innerHTML += `

            <path
                class="start-arrow"
                d="
                    M ${startX} ${start.y}
                    L ${endX} ${start.y}
                ">
            </path>

            <text
                x="${startX - 5}"
                y="${start.y - 12}"
                class="start-label">
                START
            </text>

        `;
    }


    /* =========================================
       DRAW TRANSITION EDGES
       ========================================= */

    const groupedEdges = {};

    machine.transitions.forEach(
        (transition, index) => {

            const key =
                transition.current +
                "→" +
                transition.next;

            if (!groupedEdges[key]) {
                groupedEdges[key] = [];
            }

            groupedEdges[key].push({
                transition,
                index
            });

        }
    );


    Object.keys(groupedEdges).forEach(key => {

        const group =
            groupedEdges[key];

        group.forEach((item, groupIndex) => {

            const transition =
                item.transition;

            const from =
                positions[transition.current];

            const to =
                positions[transition.next];

            if (!from || !to) {
                return;
            }


            const isSelfLoop =
                transition.current ===
                transition.next;


            let pathData;
            let labelX;
            let labelY;


            /* =================================
               SELF LOOP
               ================================= */

            if (isSelfLoop) {

                const loopHeight =
                    75 +
                    groupIndex * 25;

                pathData = `
                    M ${from.x - 24} ${from.y - 27}

                    C
                    ${from.x - 85} ${from.y - loopHeight}
                    ${from.x + 85} ${from.y - loopHeight}
                    ${from.x + 24} ${from.y - 27}
                `;

                labelX = from.x;
                labelY =
                    from.y -
                    loopHeight +
                    12;

            }

            /* =================================
               NORMAL TRANSITION
               ================================= */

            else {

                const dx =
                    to.x - from.x;

                const direction =
                    dx >= 0 ? 1 : -1;

                const distance =
                    Math.abs(dx);

                const offset =
                    Math.min(
                        90,
                        Math.max(
                            35,
                            distance * 0.16
                        )
                    );

                const curve =
                    groupIndex % 2 === 0
                        ? -offset
                        : offset;

                const startX =
                    from.x +
                    direction * 34;

                const endX =
                    to.x -
                    direction * 34;

                const midX =
                    (startX + endX) / 2;

                const midY =
                    from.y + curve;

                pathData = `
                    M ${startX} ${from.y}

                    Q
                    ${midX} ${midY}
                    ${endX} ${to.y}
                `;

                labelX = midX;
                labelY = midY;

            }


            /* =================================
               ACTIVE TRANSITION
               ================================= */

            const active =
                isCurrentTransition(
                    transition
                );


            const edgeClass =
                active
                    ? "diagram-edge active"
                    : "diagram-edge";


            const labelClass =
                active
                    ? "transition-label active"
                    : "transition-label";


            edgesGroup.innerHTML += `

                <path
                    class="${edgeClass}"
                    d="${pathData}">
                </path>

                <g>

                    <rect
                        class="transition-label-bg"
                        x="${labelX - 62}"
                        y="${labelY - 13}"
                        width="124"
                        height="26"
                        rx="7">
                    </rect>

                    <text
                        x="${labelX}"
                        y="${labelY}"
                        class="${labelClass}">

                        ${escapeSVG(
                formatTransitionLabel(
                    transition
                )
            )}

                    </text>

                </g>

            `;

        });

    });


    /* =========================================
       DRAW STATES
       ========================================= */

    states.forEach(state => {

        const pos =
            positions[state];

        const isFinal =
            machine.F.includes(state);

        const isActive =
            simulation &&
            simulation.state === state;


        let stateClass =
            "diagram-state";

        if (isFinal) {
            stateClass += " final";
        }

        if (isActive) {
            stateClass += " active";
        }


        statesGroup.innerHTML += `

            <circle
                cx="${pos.x}"
                cy="${pos.y}"
                r="31"
                class="${stateClass}">
            </circle>

        `;


        /* Double circle for final states */

        if (isFinal) {

            statesGroup.innerHTML += `

                <circle
                    cx="${pos.x}"
                    cy="${pos.y}"
                    r="25"
                    class="final-ring">
                </circle>

            `;

        }


        statesGroup.innerHTML += `

            <text
                x="${pos.x}"
                y="${pos.y}"
                class="state-label">

                ${escapeSVG(state)}

            </text>

        `;


        /* Start label */

        if (state === machine.q0) {

            statesGroup.innerHTML += `

                <text
                    x="${pos.x}"
                    y="${pos.y + 50}"
                    class="state-small-label">

                    START STATE

                </text>

            `;

        }


        /* Final label */

        if (isFinal) {

            statesGroup.innerHTML += `

                <text
                    x="${pos.x}"
                    y="${pos.y + 50}"
                    class="state-small-label">

                    FINAL STATE

                </text>

            `;

        }

    });

}


/* =========================================================
   FORMAT TRANSITION LABEL
   ========================================================= */

function formatTransitionLabel(transition) {

    const replacement =
        transition.replacement.length
            ? transition.replacement.join(" ")
            : EPSILON;

    return (
        transition.input +
        ", " +
        transition.stackTop +
        " → " +
        replacement
    );
}


/* =========================================================
   CHECK ACTIVE TRANSITION
   ========================================================= */

function isCurrentTransition(transition) {

    if (!simulation ||
        !simulation.lastTransition) {

        return false;
    }

    const active =
        simulation.lastTransition;

    return (
        active.current === transition.current &&
        active.input === transition.input &&
        active.stackTop === transition.stackTop &&
        active.next === transition.next &&
        active.replacement.join(",") ===
        transition.replacement.join(",")
    );
}


/* =========================================================
   ESCAPE SVG TEXT
   ========================================================= */

function escapeSVG(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= VALIDATE DPDA ================= */

function validateDPDA(showMessage = true) {

    const machine = getMachine();

    let errors = [];

    /* Validate q0 */

    if (!machine.Q.includes(machine.q0)) {

        errors.push(
            "Start state q₀ must belong to Q."
        );
    }


    /* Validate Z0 */

    if (!machine.Gamma.includes(machine.Z0)) {

        errors.push(
            "Initial stack symbol Z₀ must belong to Γ."
        );
    }


    /* Validate final states */

    machine.F.forEach(state => {

        if (!machine.Q.includes(state)) {

            errors.push(
                `Final state ${state} is not in Q.`
            );
        }

    });


    /* DPDA determinism */

    const map = {};

    machine.transitions.forEach(t => {

        if (!machine.Q.includes(t.current)) {

            errors.push(
                `State ${t.current} is not in Q.`
            );
        }

        if (!machine.Q.includes(t.next)) {

            errors.push(
                `Next state ${t.next} is not in Q.`
            );
        }

        if (!machine.Gamma.includes(t.stackTop)) {

            errors.push(
                `Stack symbol ${t.stackTop} is not in Γ.`
            );
        }

        if (
            t.input !== EPSILON &&
            !machine.Sigma.includes(t.input)
        ) {

            errors.push(
                `Input symbol ${t.input} is not in Σ.`
            );
        }


        const key =
            t.current + "|" +
            t.input + "|" +
            t.stackTop;

        if (map[key]) {

            errors.push(
                `Duplicate transition found for δ(${t.current}, ${t.input}, ${t.stackTop}).`
            );

        }

        map[key] = true;

    });


    /* Check epsilon conflict */

    machine.Q.forEach(state => {

        machine.Gamma.forEach(stackSymbol => {

            const epsilonTransition =
                machine.transitions.some(t =>
                    t.current === state &&
                    t.stackTop === stackSymbol &&
                    t.input === EPSILON
                );

            const normalTransition =
                machine.transitions.some(t =>
                    t.current === state &&
                    t.stackTop === stackSymbol &&
                    t.input !== EPSILON
                );

            if (
                epsilonTransition &&
                normalTransition
            ) {

                errors.push(
                    `Determinism error: ε-transition conflicts with input transition at state ${state}, stack symbol ${stackSymbol}.`
                );
            }

        });

    });


    if (errors.length > 0) {

        if (showMessage) {

            alert(
                "DPDA Validation Failed:\n\n" +
                errors.join("\n")
            );
        }

        return false;
    }


    if (machine.transitions.length === 0) {

        if (showMessage) {

            alert(
                "Please add at least one transition."
            );
        }

        return false;
    }


    if (showMessage) {

        alert(
            "✓ Valid DPDA!\n\n" +
            "The machine satisfies the basic deterministic conditions."
        );
    }

    return true;
}


/* ================= FIND TRANSITION ================= */

function findTransition(
    machine,
    state,
    inputSymbol,
    stackTop
) {

    /* First search for normal input transition */

    let transition =
        machine.transitions.find(t =>

            t.current === state &&
            t.input === inputSymbol &&
            t.stackTop === stackTop

        );


    if (transition) return transition;


    /* Then search for epsilon transition */

    transition =
        machine.transitions.find(t =>

            t.current === state &&
            t.input === EPSILON &&
            t.stackTop === stackTop

        );


    return transition;
}


/* ================= START SIMULATION ================= */

function startSimulation() {

    if (!validateDPDA(false)) {

        alert(
            "Please fix the DPDA configuration first."
        );

        return;
    }


    const machine = getMachine();

    const input =
        document.getElementById("inputString").value;


    /* Check input symbols */

    for (let symbol of input) {

        if (!machine.Sigma.includes(symbol)) {

            showResult(
                false,
                `Input symbol "${symbol}" does not belong to Σ.`
            );

            return;
        }
    }


    simulation = {

        machine: machine,

        input: input,

        position: 0,

        state: machine.q0,

        stack: [machine.Z0],

        steps: 0,

        halted: false

    };


    clearTrace();

    addTrace(
        "Initial Configuration"
    );

    updateUI();


    let safetyCounter = 0;

    while (
        !simulation.halted &&
        safetyCounter < 100
    ) {

        stepSimulation();

        safetyCounter++;
    }
}


/* ================= SINGLE STEP ================= */

function stepSimulation() {

    if (!simulation) {

        if (!validateDPDA(false)) {

            alert(
                "Please configure a valid DPDA first."
            );

            return;
        }


        const machine = getMachine();

        const input =
            document.getElementById("inputString").value;


        simulation = {

            machine,

            input,

            position: 0,

            state: machine.q0,

            stack: [machine.Z0],

            steps: 0,

            halted: false

        };


        clearTrace();

        addTrace(
            "Initial Configuration"
        );
    }


    if (simulation.halted) return;


    const { machine } = simulation;


    /* Input and stack status */

    const inputFinished =
        simulation.position >= simulation.input.length;

    const currentInput =
        inputFinished
            ? null
            : simulation.input[simulation.position];

    const stackTop =
        simulation.stack[
        simulation.stack.length - 1
        ];


    /* If stack is empty */

    if (stackTop === undefined) {

        finishSimulation();

        return;
    }


    let transition;


    if (!inputFinished) {

        transition = findTransition(
            machine,
            simulation.state,
            currentInput,
            stackTop
        );

    } else {

        /* Only epsilon transition after input is finished */

        transition =
            machine.transitions.find(t =>

                t.current === simulation.state &&
                t.input === EPSILON &&
                t.stackTop === stackTop

            );
    }


    /* No transition found */

    if (!transition) {

        finishSimulation();

        return;
    }


    /* Pop stack */

    simulation.stack.pop();


    /* Push replacement */

    for (
        let i = transition.replacement.length - 1;
        i >= 0;
        i--
    ) {

        simulation.stack.push(
            transition.replacement[i]
        );
    }


    /* Consume input */

    if (transition.input !== EPSILON) {

        simulation.position++;
    }


    /* Change state */

    simulation.state =
        transition.next;

    simulation.lastTransition =
        transition;

    simulation.steps++;

    renderTransitionDiagram();


    addTrace(
        `δ(${transition.current}, ${transition.input}, ${transition.stackTop}) → (${transition.next}, ${transition.replacement.join("") || EPSILON})`
    );


    updateUI();
}


/* ================= FINISH ================= */

function finishSimulation() {

    simulation.halted = true;


    const inputFinished =
        simulation.position >= simulation.input.length;


    const accepted =
        inputFinished &&
        simulation.machine.F.includes(
            simulation.state
        );


    if (accepted) {

        showResult(
            true,
            `Input accepted in final state ${simulation.state}.`
        );

    } else {

        showResult(
            false,
            `Input rejected. Machine halted at state ${simulation.state}.`
        );
    }
}


/* ================= UPDATE UI ================= */

function updateUI() {

    if (!simulation) return;


    const remaining =
        simulation.input.slice(
            simulation.position
        );


    const top =
        simulation.stack.length
            ? simulation.stack[
            simulation.stack.length - 1
            ]
            : EPSILON;


    document.getElementById(
        "currentState"
    ).textContent =
        simulation.state;


    document.getElementById(
        "remainingInput"
    ).textContent =
        remaining || EPSILON;


    document.getElementById(
        "stackTop"
    ).textContent =
        top;


    document.getElementById(
        "stepCount"
    ).textContent =
        simulation.steps;


    renderStack();
}


/* ================= STACK VISUALIZATION ================= */

function renderStack() {

    const container =
        document.getElementById(
            "stackDisplay"
        );


    if (!simulation.stack.length) {

        container.innerHTML =
            "<p>ε (Empty Stack)</p>";

        return;
    }


    const stack =
        [...simulation.stack].reverse();


    container.innerHTML =
        stack.map(symbol =>

            `<div class="stack-item">
                ${symbol}
            </div>`

        ).join("");
}


/* ================= TRACE ================= */

function clearTrace() {

    document.getElementById(
        "traceTable"
    ).innerHTML = "";
}


function addTrace(transitionText) {

    const table =
        document.getElementById(
            "traceTable"
        );


    const row =
        document.createElement("tr");


    const remaining =
        simulation.input.slice(
            simulation.position
        ) || EPSILON;


    const stack =
        simulation.stack.length
            ? [...simulation.stack]
                .reverse()
                .join(" ")
            : EPSILON;


    row.innerHTML = `

        <td>${simulation.steps}</td>

        <td>${simulation.state}</td>

        <td>${remaining}</td>

        <td>${stack}</td>

        <td>${transitionText}</td>

    `;


    table.appendChild(row);
}


/* ================= RESULT ================= */

function showResult(
    accepted,
    message
) {

    const box =
        document.getElementById(
            "resultBox"
        );


    const icon =
        document.querySelector(
            ".result-icon"
        );


    const title =
        document.getElementById(
            "resultTitle"
        );


    const text =
        document.getElementById(
            "resultMessage"
        );


    if (accepted) {

        icon.textContent = "✓";

        title.textContent =
            "Accepted";

        box.style.borderColor =
            "#4caf78";

    } else {

        icon.textContent = "✕";

        title.textContent =
            "Rejected";

        box.style.borderColor =
            "#d35b6b";
    }


    text.textContent =
        message;
}


/* ================= RESET ================= */

function resetSimulation() {

    simulation = null;


    document.getElementById(
        "currentState"
    ).textContent = "—";


    document.getElementById(
        "remainingInput"
    ).textContent = "—";


    document.getElementById(
        "stackTop"
    ).textContent = "—";


    document.getElementById(
        "stepCount"
    ).textContent = "0";


    document.getElementById(
        "stackDisplay"
    ).innerHTML =
        "<p>Stack will appear here</p>";


    document.getElementById(
        "traceTable"
    ).innerHTML = `

        <tr>
            <td colspan="5" class="empty">
                No simulation has been run.
            </td>
        </tr>

    `;


    document.querySelector(
        ".result-icon"
    ).textContent = "?";


    document.getElementById(
        "resultTitle"
    ).textContent = "Ready";


    document.getElementById(
        "resultMessage"
    ).textContent =
        "Enter an input and run the DPDA.";
}
renderTransitionDiagram();


/* ================= SCROLL ================= */

function scrollToSimulator() {

    document
        .getElementById("simulator")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* ================= DEFAULT DPDA ================= */

/*
   Example:

   L = { a^n b^n | n >= 1 }

   Push A for every 'a'
   Pop A for every 'b'
   Accept when Z0 remains
*/

addTransition({
    current: "q0",
    input: "a",
    stackTop: "Z0",
    next: "q0",
    replace: "A,Z0"
});

addTransition({
    current: "q0",
    input: "a",
    stackTop: "A",
    next: "q0",
    replace: "A,A"
});

addTransition({
    current: "q0",
    input: "b",
    stackTop: "A",
    next: "q1",
    replace: "ε"
});

addTransition({
    current: "q1",
    input: "b",
    stackTop: "A",
    next: "q1",
    replace: "ε"
});

addTransition({
    current: "q1",
    input: "ε",
    stackTop: "Z0",
    next: "qf",
    replace: "Z0"
});
/* =========================================================
   AUTO UPDATE DIAGRAM
   ========================================================= */

document.addEventListener("input", function (event) {

    if (
        event.target.closest("#transitionTable") ||
        event.target.id === "states" ||
        event.target.id === "startState" ||
        event.target.id === "finalStates"
    ) {

        renderTransitionDiagram();

    }

});