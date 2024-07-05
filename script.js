document.addEventListener('DOMContentLoaded', function() {
    const strategyData = [
        { type: 'B', expiry: '2024-07-05', strike: 24050, optionType: 'PE', lots: 1, price: 20.5 },
        { type: 'S', expiry: '2024-07-05', strike: 24250, optionType: 'PE', lots: 1, price: 68.6 },
        { type: 'S', expiry: '2024-07-05', strike: 24250, optionType: 'CE', lots: 1, price: 106.6 },
        { type: 'B', expiry: '2024-07-05', strike: 24450, optionType: 'CE', lots: 1, price: 23.9 }
    ];

    const tableBody = document.getElementById('strategy-table');

    strategyData.forEach((row, index) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <select onchange="updateOption(${index}, 'type', this.value)">
                    <option value="B" ${row.type === 'B' ? 'selected' : ''}>B</option>
                    <option value="S" ${row.type === 'S' ? 'selected' : ''}>S</option>
                </select>
            </td>
            <td><input type="date" value="${row.expiry}" onchange="updateOption(${index}, 'expiry', this.value)"></td>
            <td>
                <button onclick="updateStrike(${index}, -1)">-</button>
                <input type="number" value="${row.strike}" onchange="updateStrikeManual(${index}, this.value)">
                <button onclick="updateStrike(${index}, 1)">+</button>
            </td>
            <td>
                <select onchange="updateOption(${index}, 'optionType', this.value)">
                    <option value="PE" ${row.optionType === 'PE' ? 'selected' : ''}>PE</option>
                    <option value="CE" ${row.optionType === 'CE' ? 'selected' : ''}>CE</option>
                </select>
            </td>
            <td><input type="number" value="${row.lots}" min="1" onchange="updateGraph()"></td>
            <td>${row.price.toFixed(1)}</td>
        `;

        tableBody.appendChild(tr);
    });

    const ctx = document.getElementById('payoff-chart').getContext('2d');
    const payoffChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: 'Payoff',
                data: [], 
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Stock Price'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Payoff'
                    }
                }
            }
        }
    });

    function updateGraph() {
        const stockPrices = [];
        const payoffs = [];
          
        for (let i = 23000; i <= 25000; i += 50) {
            stockPrices.push(i);
            let payoff = 0;
            strategyData.forEach(row => {
                if (row.optionType === 'PE') {
                    payoff += row.type === 'B' ? Math.max(0, row.strike - i) : -Math.max(0, row.strike - i);
                } else {
                    payoff += row.type === 'B' ? Math.max(0, i - row.strike) : -Math.max(0, i - row.strike);
                }
            });
            payoffs.push(payoff);
        }

        payoffChart.data.labels = stockPrices;
        payoffChart.data.datasets[0].data = payoffs;
        payoffChart.update();
    }

    window.updateStrike = function(index, change) {
        const row = strategyData[index];
        row.strike += change;
        updateTableRow(index, row.strike);
        updateGraph();
    };

    window.updateStrikeManual = function(index, value) {
        const row = strategyData[index];
        row.strike = parseInt(value);
        updateGraph();
    };

    window.updateOption = function(index, key, value) {
        strategyData[index][key] = value;
        updateGraph();
    };

    function updateTableRow(index, newStrike) {
        const tableBody = document.getElementById('strategy-table');
        const row = tableBody.children[index];
        const strikeInput = row.querySelector('input[type="number"]');
        strikeInput.value = newStrike;
    }

    updateGraph(); 
});
