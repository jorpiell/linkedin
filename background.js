const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const WIDTH = 1300;
const HEIGHT = 350;
const LEFT_SPACE = 325;
const MARGIN_LEFT = LEFT_SPACE + 20;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 40;
const ROW_HEIGHT = 60;
const ICON_SIZE = 40;
const YEAR_START = 2005;
const YEAR_END = 2025;
const YEAR_SPACING = (WIDTH - MARGIN_LEFT - MARGIN_RIGHT) / (YEAR_END - YEAR_START);
const BACKGROUND_IMAGE = 'img/background.jpg';

const technologies = [
    {
        name: 'Java',
        color: '#f89820',
        usages: [
            { start: 2005, end: 2012, usage: 100 },
            { start: 2012, end: 2015, usage: 70 },
            { start: 2015, end: 2022, usage: 30 },
            { start: 2024, end: 2025, usage: 25 }
        ],
        logo: 'img/java.png'
    },
    {
        name: 'Ruby on Rails',
        color: '#cc0000',
        usages: [
            { start: 2012, end: 2022, usage: 30 },
            { start: 2024, end: 2025, usage: 25 }
        ],
        logo: 'img/ruby.png'
    },
    {
        name: 'JavaScript',
        color: '#f7df1e',
        usages: [
            { start: 2015, end: 2022, usage: 40 },
            { start: 2022, end: 2024, usage: 100 },
            { start: 2024, end: 2025, usage: 50 }
        ],
        logo: 'img/javascript.png'
    },
    {
        name: 'TypeScript',
        color: '#007acc',
        usages: [
            { start: 2022, end: 2024, usage: 100 },
            { start: 2024, end: 2025, usage: 50 }
        ],
        logo: 'img/typescript.png'
    },
    {
        name: 'React Native',
        color: '#61dafb',
        usages: [
            { start: 2022, end: 2024, usage: 100 }
        ],
        logo: 'img/react_native.png'
    }
];

async function drawTimeline() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    try {
        const background = await loadImage(BACKGROUND_IMAGE);
        ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
    } catch (error) {
        console.error('No se pudo cargar la imagen de fondo:', error);
    }

    technologies.forEach((tech, index) => {
        const y = MARGIN_TOP + index * ROW_HEIGHT;

        tech.usages.forEach((period, periodIndex) => {
            const xStart = MARGIN_LEFT + (period.start - YEAR_START) * YEAR_SPACING;
            const xEnd = MARGIN_LEFT + (period.end - YEAR_START) * YEAR_SPACING;
            const barHeight = 20;
            const gradient = ctx.createLinearGradient(xStart, y, xEnd, y);

            if (periodIndex > 0) {
                const prevUsage = tech.usages[periodIndex - 1].usage;
                gradient.addColorStop(0, `${tech.color}${hexOpacity(prevUsage)}`);
            } else {
                gradient.addColorStop(0, `${tech.color}${hexOpacity(period.usage)}`);
            }
            gradient.addColorStop(1, `${tech.color}${hexOpacity(period.usage)}`);

            ctx.fillStyle = gradient;
            ctx.fillRect(xStart, y, xEnd - xStart, barHeight);

            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(`${period.usage}%`, (xStart + xEnd) / 2 - 10, y + 15);
        });
    });

    await Promise.all(technologies.map(async (tech, index) => {
        const y = MARGIN_TOP + index * ROW_HEIGHT;
        try {
            const img = await loadImage(tech.logo);
            const aspectRatio = img.width / img.height;
            const newWidth = aspectRatio > 1 ? ICON_SIZE : ICON_SIZE * aspectRatio;
            const newHeight = aspectRatio > 1 ? ICON_SIZE / aspectRatio : ICON_SIZE;
            const iconX = MARGIN_LEFT - ICON_SIZE - 10;

            ctx.drawImage(img, iconX, y - 10, newWidth, newHeight);
        } catch (error) {
            console.error(`No se pudo cargar el logo de ${tech.name}:`, error);
        }
    }));

    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    for (let year = YEAR_START; year <= YEAR_END; year += 5) {
        const x = MARGIN_LEFT + (year - YEAR_START) * YEAR_SPACING;
        ctx.fillText(year, x - 10, HEIGHT - 20);
    }

    fs.writeFileSync('timeline.png', canvas.toBuffer('image/png'));
    console.log('Imagen generada: timeline.png');
}

function hexOpacity(usage) {
    return Math.round((usage / 100) * 255).toString(16).padStart(2, '0');
}

drawTimeline();