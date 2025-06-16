export function useFormatWMSPopup() {
    const extractValueByLabel = (container: HTMLElement, label: string): string => {
        const tds = container.querySelectorAll("td");
        for (let i = 0; i < tds.length; i++) {
            if (tds[i].textContent?.trim() === label && tds[i + 1]) {
                return tds[i + 1].textContent?.trim() ?? "";
            }
        }
        return "";
    };

    const format = (rawHtml: string): string => {
        const div = document.createElement("div");
        div.innerHTML = rawHtml;

        const description = extractValueByLabel(div, "Description");
        const commune = extractValueByLabel(div, "Situé sur la commune");
        const panneau = extractValueByLabel(div, "Présence de panneau");
        const longitude = extractValueByLabel(div, "Longitude");
        const latitude = extractValueByLabel(div, "Latitude");
        const dfci = extractValueByLabel(div, "Coordonnées DFCI");

        return `
        <div>
            <strong>Description:</strong> ${description}<br/>
            <strong>Situé sur la commune de :</strong> ${commune}<br/>
            <strong>Présence de panneau:</strong> ${panneau}<br/>
            <strong>Longitude:</strong> ${longitude}<br/>
            <strong>Latitude:</strong> ${latitude}<br/>
            <strong>Coordonnées DFCI :</strong> ${dfci}
        </div>`;
    };

    return { formatWMSPopup: format };
}
