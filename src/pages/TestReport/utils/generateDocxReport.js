import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Header,
    ImageRun,
    AlignmentType,
    SectionType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
} from "docx";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const getResultColor = (comment) => {
    switch (comment) {
        case "El tiempo de reacción es el esperado":
            return "27E800";
        case "El tiempo de reacción NO es el esperado":
            return "F3FC00";
        case "El tiempo de reacción no puede ser evaluado por error presentado":
            return "FF0000";
        default:
            return "FFFFFF";
    }
};


export async function buildDocxReport(report, customer, unit) {
    const imageResponse = await fetch("/images/motum-all.png");
    const imageBuffer = await imageResponse.arrayBuffer();
    const serie = unit?.split(" ~ ")?.[1];
    const serialNumber = (serie?.split(": ")?.[1]) ?? "~";
    const unitNumber = (unit?.split(" ~ ")?.[0]?.split(": ")?.[1]) ?? "~";

    const header = new Header({
        children: [
            new Paragraph({
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: 200,
                            height: 140,
                        },
                    }),
                ],
            }),
        ],
    });

    const title = new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 },
        children: [
            new TextRun({
                text: "INFORME DE PRUEBA",
                color: "2E6EDB",
                size: 48,
            }),
        ],
    });

    const createSectionHeader = (text) =>
        new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: {
                before: 100,
                after: 200,
                line: 400,
            },
            shading: {
                type: "clear",
                fill: "DCE6F1",
            },
            children: [
                new TextRun({
                    text: `  ${text}  `,
                    size: 28,
                    font: "Arial",
                }),
            ],
        });



    const createDatosReporteTable = () =>
        new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: "none", size: 0, color: "FFFFFF" },
                bottom: { style: "none", size: 0, color: "FFFFFF" },
                left: { style: "none", size: 0, color: "FFFFFF" },
                right: { style: "none", size: 0, color: "FFFFFF" },
                insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
                insideVertical: { style: "none", size: 0, color: "FFFFFF" },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Fecha de operación")] }),
                        new TableCell({ children: [new Paragraph("Unidad")] }),
                        new TableCell({ children: [new Paragraph("Equipo")] }),
                        new TableCell({ children: [new Paragraph("Flota")] }),
                        new TableCell({ children: [new Paragraph("INICIO")] }),
                        new TableCell({ children: [new Paragraph("FIN")] }),
                    ],
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(dayjs(report?.testingDate)?.format('D [de] MMMM [de] YYYY'))] }),
                        new TableCell({ children: [new Paragraph(unitNumber)] }),
                        new TableCell({ children: [new Paragraph(`SUN-${serialNumber}`)] }),
                        new TableCell({ children: [new Paragraph(customer ?? "")] }),
                        new TableCell({ children: [new Paragraph(`${report?.testingStart} horas` ?? "")] }),
                        new TableCell({ children: [new Paragraph(`${report?.testingEnd} horas` ?? "")] }),
                    ],
                }),
            ],
        });


    const createPruebasTable = () =>
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "EVENTO", bold: true, color: "000000" })],
                                }),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "RESULTADO", bold: true, color: "000000" })],
                                }),
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: "OBSERVACIONES", bold: true, color: "000000" })],
                                }),
                            ],
                        }),
                    ],
                }),
                ...report?.testsDetails.map((item) =>
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: item.test, color: "000000" })],
                                    }),
                                ],
                            }),
                            new TableCell({
                                shading: {
                                    type: ShadingType.CLEAR,
                                    fill: getResultColor(item.comment),
                                },
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: "", color: "000000" })],
                                    }),
                                ],
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: item.comment, color: "000000" })],
                                    }),
                                ],
                            }),
                        ],
                    })
                ),
            ],
        });

    const listTestHeaders = report?.tests.flatMap((test) => [
        createSectionHeader(test?.toUpperCase()),
        new Paragraph({ spacing: { after: 300 } }),
    ]);


    const createTestersList = () =>
        report?.testers.map((tester) =>
            new Paragraph({
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: `${tester.name} (${tester.position})`,
                        size: 20,
                    }),
                ],
            })
        );

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Arial",
                    }
                },
            },
        },
        sections: [
            {
                headers: { default: header },
                properties: { type: SectionType.CONTINUOUS },
                children: [
                    title,
                    createSectionHeader("DATOS DE REPORTE"),
                    createDatosReporteTable(),
                    new Paragraph({ spacing: { after: 300 } }),

                    createSectionHeader("HECHOS"),
                    new Paragraph(report?.eventSumary),
                    new Paragraph({ spacing: { after: 300 } }),
                    new Paragraph("Las pruebas se realizaron en presencia de:"),
                    new Paragraph({ spacing: { after: 300 } }),
                    ...createTestersList(),
                    new Paragraph({ spacing: { after: 100 } }),

                    createSectionHeader("PRUEBAS REALIZADAS"),
                    createPruebasTable(),
                    new Paragraph({
                        pageBreakBefore: true,
                    }),

                    ...listTestHeaders,

                    new Paragraph({ spacing: { after: 300 } }),
                    createSectionHeader("COMENTARIOS FINALES"),
                    new Paragraph({ spacing: { after: 300 } }),
                    new Paragraph(report?.finalComments),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prueba-${customer}-unidad${unitNumber}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}