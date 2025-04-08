import { useState, useEffect, useCallback } from "react";
import { FormLayout, LegacyCard, Page, Autocomplete, Icon, TextField, Button, } from "@shopify/polaris";
import { SearchIcon, PlusIcon, XIcon, BlogIcon, } from '@shopify/polaris-icons';
import { useToast } from "../../components/Toast";
import dayjs from "dayjs";
import Events from "./components/Events";
import EventsDetails from "./components/EventsDetails";

export default function TestReport() {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [report, setReport] = useState({
        testingDate: "",
        testingStart: "",
        testingEnd: "",
        eventSumary: "",
        testers: [],
        tests: [],
        testsDetails: [],
        finalComments: "",
    });
    const [customers, setCustomers] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedOptionsUnits, setSelectedOptionsUnits] = useState([]);
    const [inputValueUnits, setInputValueUnits] = useState('');
    const [optionsUnits, setOptionsUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    useEffect(() => {
        retrieveCustomers();
    }, []);

    useEffect(() => {
        if (selectedOptions.length === 0) return;
        retrieveUnits();
    }, [selectedOptions]);

    const retrieveCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const response = await fetch("https://secure.tecnomotum.com/apis/srmotum/clientsmw2");
            if (!response?.ok) {
                console.error("Error retrieving customers");
                return;
            }
            const json = await response?.json();
            if (!json || !Array.isArray(json)) {
                console.error("Bad response");
                return;
            }
            const selectableCustomers = json?.map((current, index) => ({ label: current?.commercialName, value: current?.clientId?.toString() }));
            setCustomers(selectableCustomers ?? []);
            setOptions(selectableCustomers ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCustomers(false);
        }
    }

    const retrieveUnits = async () => {
        setUnits([]);
        setSelectedOptionsUnits([]);
        setInputValueUnits('');
        setOptionsUnits([]);
        setLoadingUnits(true);
        try {
            const response = await fetch("https://secure.tecnomotum.com/apis/cim/suscriptions", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idClient: selectedOptions ?? "",
                }),
            });
            const json = await response?.json();
            if (!json || !Array.isArray(json)) {
                console.error("Bad response");
                return;
            }
            const selectableUnits = json?.map((current, index) => ({ label: `Número: ${current?.vehicleNumber} ~ Serie: ${current?.serialNumber}`, value: current?.assetId?.toString() }));
            setUnits(selectableUnits);
            setOptionsUnits(selectableUnits);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUnits(false);
        }
    }

    const handleNextStep = () => setStep(currentStep => currentStep + 1);
    const handlePrevStep = () => setStep(currentStep => currentStep - 1);

    const handleInputDateChange = (field, value) => {
        setReport(current => ({
            ...current,
            [field]: value?.target?.value ?? "",
        }));
    }

    const handleDeleteTester = (tester, index) => {
        const currentTesters = [...report?.testers]?.filter((current, currentIndex) => index !== currentIndex);
        setReport(current => ({ ...current, testers: currentTesters }));
    }

    const handleEditTesterChange = (field, value, index, tester) => {
        const currentTesters = [...report?.testers]?.map((current, currentIndex) => {
            return currentIndex !== index ? current : {
                ...current,
                [field]: value,
            };
        });
        setReport(current => ({ ...current, testers: currentTesters }));
    }

    const handleSetTests = (currentTest) => {
        setReport(currentReport => ({
            ...currentReport,
            tests: currentTest,
        }));
    }

    const handleAddTestDetailsTemplate = (newTest) => {
        setReport(current => ({
            ...current,
            testsDetails: [...current?.testsDetails, { test: newTest, result: "", comment: "", }],
        }));
    }

    const handleDeleteTestDetails = (test) => {
        const newTestDetails = report?.testsDetails?.filter(current => current?.test !== test);
        setReport(current => ({
            ...current,
            testsDetails: newTestDetails,
        }));
    }

    const handleSetTestDetails = (details) => {
        setReport(current => ({
            ...current,
            testsDetails: details, 
        }))
    }

    const handleFinalCommentsInputChange = (finalComment) => {
        setReport(current => ({ ...current, finalComments: finalComment }));
    }

    const handleBuildDoc = () => {
        console.log("handleBuildDoc");
    }

    const isThereSomeTesterEmpty = report?.testers?.some(current => !current?.name || !current?.position);

    const updateText = useCallback(
        (value) => {
            setInputValue(value);

            if (value === '') {
                setOptions(customers);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = options.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptions(resultOptions);
        },
        [options],
    );

    const updateSelection = useCallback(
        (selected) => {
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = options.find((option) => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });

            setSelectedOptions(selected);
            setInputValue(selectedValue[0] || '');
        },
        [options],
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label="Flota:"
            value={inputValue}
            prefix={<Icon source={SearchIcon} tone="base" />}
            placeholder="Buscar"
            autoComplete="off"
            loading={loadingCustomers}
            disabled={loadingCustomers}
        />
    );

    const updateTextUnits = useCallback(
        (value) => {
            setInputValueUnits(value);

            if (value === '') {
                setOptionsUnits(units);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = optionsUnits.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptionsUnits(resultOptions);
        },
        [optionsUnits],
    );

    const updateSelectionUnits = useCallback(
        (selected) => {
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = optionsUnits.find((option) => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });

            setSelectedOptionsUnits(selected);
            setInputValueUnits(selectedValue[0] || '');
        },
        [optionsUnits],
    );

    const textFieldUnits = (
        <Autocomplete.TextField
            onChange={updateTextUnits}
            label="Unidad:"
            value={inputValueUnits}
            prefix={<Icon source={SearchIcon} tone="base" />}
            placeholder="Buscar"
            autoComplete="off"
            loading={loadingUnits}
            disabled={loadingUnits}
        />
    );

    return (
        <Page
            title="Informe de Pruebas"
        >
            {
                (step === 1) ? (
                    <LegacyCard
                        title="Datos de reporte"
                        sectioned
                        primaryFooterAction={{
                            content: 'Aceptar',
                            onAction: handleNextStep,
                            disabled: (selectedOptions.length === 0 || selectedOptionsUnits.length === 0),
                        }}
                    >
                        <FormLayout>
                            <Autocomplete
                                options={options}
                                selected={selectedOptions}
                                onSelect={updateSelection}
                                textField={textField}
                            />
                            {
                                (inputValue && selectedOptions?.length > 0) && (
                                    <Autocomplete
                                        options={optionsUnits}
                                        selected={selectedOptionsUnits}
                                        onSelect={updateSelectionUnits}
                                        textField={textFieldUnits}
                                    />
                                )
                            }
                        </FormLayout>
                    </LegacyCard>
                ) : (step === 2) ? (
                    <LegacyCard
                        title="Datos de reporte"
                        sectioned
                        primaryFooterAction={{
                            content: 'Aceptar',
                            onAction: handleNextStep,
                            disabled: (!report?.testingDate || !report?.testingStart || !report?.testingEnd),
                        }}
                        secondaryFooterActions={[
                            {
                                content: "Atrás",
                                onAction: handlePrevStep,
                            },
                        ]}
                    >
                        <FormLayout>
                            <div className="flex flex-col space-y-2 py-4">
                                <div className="flex flex-col">
                                    <label className="text-gray-700 font-medium">Fecha de operación:</label>
                                    <input
                                        type="date"
                                        className="border border-gray-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
                                        onChange={(value) => handleInputDateChange("testingDate", value)}
                                        value={report?.testingDate}
                                        /* min={minDate} */
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col w-1/2">
                                        <label className="text-gray-700 font-medium">Inicio de la prueba:</label>
                                        <input
                                            type="time"
                                            className="border border-gray-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
                                            onChange={(value) => {
                                                setReport((current) => ({ ...current, testingEnd: "" }));
                                                handleInputDateChange("testingStart", value);
                                            }}
                                            value={report?.testingStart}
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/2">
                                        <label className="text-gray-700 font-medium">Fin de la prueba:</label>
                                        <input
                                            type="time"
                                            className="border border-gray-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
                                            onChange={(value) => {
                                                const currentDate = dayjs().format("YYYY-MM-DD");
                                                if (dayjs(`${currentDate} ${value?.target?.value}`).isBefore(dayjs(`${currentDate} ${report?.testingStart}`))) {
                                                    showToast("Selecciona una hora correcta");
                                                    return;
                                                }
                                                handleInputDateChange("testingEnd", value);
                                            }}
                                            value={report?.testingEnd}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormLayout>

                    </LegacyCard>
                ) : (step === 3) ? (
                    <LegacyCard
                        title="Hechos"
                        sectioned
                        primaryFooterAction={{
                            content: 'Aceptar',
                            onAction: handleNextStep,
                            disabled: (!report?.eventSumary || report?.testers.length === 0 || isThereSomeTesterEmpty)
                        }}
                        secondaryFooterActions={[
                            {
                                content: "Atrás",
                                onAction: handlePrevStep,
                            },
                        ]}
                    >
                        <FormLayout>
                            <LegacyCard.Section title="Resumen de los hechos">
                                <TextField
                                    value={report?.eventSumary}
                                    onChange={v => setReport(current => ({ ...current, eventSumary: v }))}
                                    multiline={4}
                                    autoComplete="off"
                                />
                            </LegacyCard.Section>
                            <LegacyCard.Section title="Supervisores">
                                {
                                    (report?.testers?.length > 0) && (
                                        <div className="w-1/2">
                                            {
                                                report?.testers?.map((tester, index) => (
                                                    <div
                                                        className="my-2 flex items-center"
                                                        key={index}
                                                    >
                                                        <div className="w-full">
                                                            <TextField value={tester?.name} placeholder="nombre" onChange={(value) => handleEditTesterChange("name", value, index, tester)} />
                                                            <TextField value={tester?.position} placeholder="puesto" onChange={(value) => handleEditTesterChange("position", value, index, tester)} />
                                                        </div>
                                                        <div className="ml-2">
                                                            <Button
                                                                tone="critical"
                                                                variant="primary"
                                                                icon={XIcon}
                                                                onClick={() => handleDeleteTester(tester, index)}
                                                            ></Button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                                <Button
                                    onClick={() => setReport(current => ({ ...current, testers: [...current?.testers, { name: "", position: "" }] }))}
                                    variant="primary"
                                    icon={PlusIcon}
                                >
                                    Añadir supervisor
                                </Button>
                            </LegacyCard.Section>
                        </FormLayout>
                    </LegacyCard>
                ) : (step === 4) ? (
                    <LegacyCard
                        title="Pruebas realizadas"
                        sectioned
                        primaryFooterAction={{
                            content: 'Aceptar',
                            onAction: handleNextStep,
                            disabled: report?.tests?.length === 0,
                        }}
                        secondaryFooterActions={[
                            {
                                content: "Atrás",
                                onAction: handlePrevStep,
                            },
                        ]}
                    >
                        <Events report={report} onSetTests={handleSetTests} onAddDetails={handleAddTestDetailsTemplate} onDeleteDetails={handleDeleteTestDetails} />
                    </LegacyCard>
                )  : (step === 5) ? (
                    <EventsDetails report={report} onSave={handleSetTestDetails} onNext={handleNextStep} onPrev={handlePrevStep} />
                ) : (step === 6) ? (
                    <LegacyCard
                        title="Comentarios finales"
                        sectioned
                        primaryFooterAction={{
                            content: 'Construir informe',
                            onAction: handleBuildDoc,
                            disabled: !report?.finalComments,
                            icon: BlogIcon,
                            destructive: true,
                        }}
                        secondaryFooterActions={[
                            {
                                content: "Atrás",
                                onAction: handlePrevStep,
                            },
                        ]}
                    >
                        <TextField
                            label="Comentarios:"
                            value={report?.finalComments ?? ""}
                            onChange={handleFinalCommentsInputChange}
                            multiline={6}
                            autoComplete="off"
                        />
                    </LegacyCard>
            )    : <></>
            }
        </Page>
    );
}