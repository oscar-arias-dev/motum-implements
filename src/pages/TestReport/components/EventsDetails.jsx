import { useEffect, useState } from "react";
import { FormLayout, Select, LegacyCard } from "@shopify/polaris";

const results = [
    { label: "Selecciona una opción", value: "" },
    { label: "El tiempo de reacción es el esperado", value: "El tiempo de reacción es el esperado" },
    { label: "El tiempo de reacción NO es el esperado", value: "El tiempo de reacción NO es el esperado" },
    { label: "El tiempo de reacción no puede ser evaluado por error presentado", value: "El tiempo de reacción no puede ser evaluado por error presentado" }
];

export default function EventsDetails({ report, onSave, onNext, onPrev }) {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        setTests(report?.testsDetails ?? []);
    }, []);

    const handleUpdateTestComment = (comment, index) => {
        const currentTests = tests?.map((currentTest, currentIndex) => index !== currentIndex ? currentTest : { ...currentTest, comment });
        setTests(currentTests);
    }

    const isThereSomeTestWithoutSelectedOption = tests?.some(current => current?.comment === "");

    return (
        <LegacyCard
            title="Detalles de las pruebas"
            sectioned
            primaryFooterAction={{
                content: 'Aceptar',
                onAction: () => {
                    onSave(tests);
                    onNext();
                },
                disabled: isThereSomeTestWithoutSelectedOption,
            }}
            secondaryFooterActions={[
                {
                    content: "Atrás",
                    onAction: onPrev,
                },
            ]}
        >

            <FormLayout>
                {
                    tests?.map((test, index) => (
                        <div key={index}>
                            <b>{test?.test}:</b>
                            <Select
                                options={results ?? []}
                                value={test?.comment}
                                onChange={(v) => handleUpdateTestComment(v, index)}
                            />
                        </div>
                    ))
                }
            </FormLayout>
        </LegacyCard>
    );
}