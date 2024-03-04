// Chart.plugins.register(ChartDataLabels)
$('#projects').val(selectedProject)
$('#sub-projects').val(selectedSheetName)
$('#campaign-month').val(selectedCampaignMonth)

// Date Range Picker
$('input[name="dates"]').daterangepicker({
    autoUpdateInput: false,
    minYear: 2023,
    maxYear: 2024,
    locale: {
        format: 'DD/MM/YYYY',
        seperator: '/',
        cancelLabel: 'Clear'
    }
})

$('input[name="dates"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'))
})

$('input[name="dates"]').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('')
})

// UPDATE SUB PROJECT
document.getElementById('projects').addEventListener('change', updateSubProjects)

function updateSubProjects() {
    var selectedProject = document.getElementById('projects').value

    if (selectedProject) {
        var filteredMetaData = metaData.filter((item) => item.project === selectedProject)
        var subProjectsSelect = document.getElementById('sub-projects')
        subProjectsSelect.innerHTML = '' // Clear existing options
        var allOption = document.createElement('option')
        allOption.value = 'ALL'
        allOption.text = 'ALL'
        subProjectsSelect.add(allOption)

        // Add options for the filtered sub-projects
        filteredMetaData.forEach((item) => {
            var option = document.createElement('option')
            option.value = item.subProject
            option.text = item.subProject
            subProjectsSelect.add(option)
        })
    } else {
        // Reset sub-projects if no project is selected
        document.getElementById('sub-projects').innerHTML = '<option value="ALL">ALL</option>'
    }
}

//UPDATE PROJECT
document.getElementById('sub-projects').addEventListener('change', updateProjects)

function updateProjects() {
    if (selectedSubProject !== 'ALL') {
        var selectedSubProject = document.getElementById('sub-projects').value
        var projectsSelect = document.getElementById('projects')
        var filteredMetaData = metaData.find((item) => item.subProject === selectedSubProject)
        projectsSelect.value = filteredMetaData.project
    } else {
        // Reset sub-projects if no project is selected
        document.getElementById('sub-projects').innerHTML = '<option value="ALL">ALL</option>'
    }
}

document.getElementById('btn-download').addEventListener('click', function () {
    // alert('After downloading the report, if you find that the report does not contain full information, then zoom out the screen and try again.')

    const element = document.querySelector('#reportingData')

    const headingElement = document.querySelector('#reportingData .heading')

    var dateParagraph = document.createElement('p')

    element.style.display = 'block'

    const currentDate = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false // Use 24-hour format
    })

    const currentTime = new Date().toLocaleTimeString()

    dateParagraph.textContent = `Last updated  on ${currentDate} : ${currentTime}`

    headingElement.appendChild(dateParagraph)
    const elementHeight = element.clientHeight
    // Format the date as YYYY-MM-DD
    const formattedDate = currentDate.split('/').join('-')
    html2canvas(element, {
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: elementHeight,
        width: document.documentElement.offsetWidth // Set canvas width to match webpage width
    })
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg')

            const link = document.createElement('a')
            // Set link's attributes
            link.href = imgData
            link.download = `${formattedDate}-Report.png`

            link.click()

            link.remove()
            element.style.display = 'none'
        })
        .catch((error) => {
            alert('Error in generating Summary', error)
        })
})

const growthViews = growthDataArray.map((item) => item.views)
const growthDates = growthDataArray.map((item) => item.date)

const growthChart = new Chart('growthChart', {
    type: 'line', // Chart type - can be 'bar', 'pie', etc.
    data: {
        labels: growthDates, // Array of date labels
        datasets: [
            {
                label: 'Views', // Dataset label for legend
                data: growthViews, // Array of view values
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Line color and opacity
                borderColor: 'rgba(255, 99, 132, 1)', // Border color
                borderWidth: 1 // Line thickness
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,

        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true // Start Y axis at 0
                    }
                }
            ]
        }
    }
})

const values = sortedByViewsArray.map((item) => item.views)
const labels = sortedByViewsArray.map(
    (item) => `Project : ${item.project}
    Views `
)

const ctx = document.getElementById('pieChart').getContext('2d')
const pieChart = new Chart(ctx, {
    type: 'pie', // Chart type - can be 'bar', 'pie', etc.
    data: {
        labels,
        datasets: [
            {
                label: 'Views',
                backgroundColor: ['#f1c40f', '#2980b9', '#d35400', '#800080', '#e67e80', '#FBE9A7', '#B2D4F1', '#E6AF92', '#80CBC4', '#FCE4EC'], // Customize colors
                data: values,
                borderColor: '#fff',
                borderWidth: (ctx) => (ctx.chart.data.datasets[0].data.length === 1 ? 0 : 3)
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
            display: false
        },
        onHover: function (event, chartElement) {
            event.target.style.cursor = chartElement[0] ? 'pointer' : 'default'
        },
        plugins: {
            labels: {
                render: 'percentage',
                precision: 2,
                fontSize: 12,

                fontColor: '#000000',

                fontStyle: 'normal',

                fontFamily: '"Nunito Sans", sans-serif',
                fontWeight: 'bold',
                shadowBlur: 10,

                shadowOffsetX: -5,

                shadowOffsetY: 5,
                arc: true,

                position: 'outside'
            }
        }
    }
})

pieChart.options.onClick = (event, element) => {
    if (!element || !element.length) return
    const index = element[0]._index

    // Open the Instagram link associated with the clicked slice
    window.open(sortedByViewsArray[index].reelLink)
}
