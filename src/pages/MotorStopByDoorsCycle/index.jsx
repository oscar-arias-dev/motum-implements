import { useState, useCallback, useEffect } from "react";
import { Page, LegacyCard, FormLayout, Button, Spinner, Select } from "@shopify/polaris";
import ReactSelect from "react-select";
import {
    SearchIcon,
    CheckboxIcon,
    CheckIcon,
    ReturnIcon,
    SettingsFilledIcon,
} from '@shopify/polaris-icons';
import Modal from "../../components/Modal";

const chatteringTimingOptions = [
    { label: "Selecciona", value: "" },
    { label: "4 seg", value: "4" },
    { label: "5 seg", value: "5" },
    { label: "6 seg", value: "6" },
    { label: "7 seg", value: "7" },
    { label: "8 seg", value: "8" },
    { label: "9 seg", value: "9" },
    { label: "10 seg", value: "10" },
];

const Timing1Options = [
    { label: "Selecciona", value: "" },
    { label: "300 seg", value: "300" },
    { label: "600 seg", value: "600" },
    { label: "900 seg", value: "900" },
    { label: "1800 seg", value: "1800" },
    { label: "2700 seg", value: "2700" },
    { label: "3600 seg", value: "3600" },
    { label: "4500 seg", value: "4500" },
];


const Timing2Options = [
    { label: "Selecciona", value: "" },
    { label: "300 seg", value: "300" },
    { label: "600 seg", value: "600" },
    { label: "900 seg", value: "900" },
    { label: "1800 seg", value: "1800" },
    { label: "2700 seg", value: "2700" },
    { label: "3600 seg", value: "3600" },
    { label: "4500 seg", value: "4500" },
];

export default function MotorStopByDoorsCycle() {
    const [step, setStep] = useState(1);
    const [customer, setCustomer] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [configuration, setConfiguration] = useState({
        chatteringTiming: "",
        timing1: "",
        timing2: "",
    });
    const [openModal, setOpenModal] = useState(false);
    const [loadingConfiguration, setLoadingConfiguration] = useState(false);


    useEffect(() => {
        retrieveCustomers();
    }, []);

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
            selectableCustomers?.unshift({ label: "Selecciona", value: "" });
            setCustomers(selectableCustomers ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCustomers(false);
        }
    }

    const handleSearch = async () => {
        setStep(2);
        setLoadingUnits(true);
        try {
            const response = await fetch("https://secure.tecnomotum.com/apis/cim/suscriptions", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idClient: [customer],
                }),
            });
            const json = await response?.json();
            if (!json || !Array.isArray(json)) {
                console.error("Bad response");
                return;
            }
            const selectableUnits = json?.map((current, index) => ({ label: `${current?.vehicleNumber} ~ ${current?.serialNumber}`, value: current?.assetId?.toString() }));
            setUnits(selectableUnits);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUnits(false);
        }
    }

    const handleSelectChange = useCallback(
        (value) => setCustomer(value),
        [],
    );

    const handleParamsChange = useCallback(
        (value, field) => setConfiguration((current) => ({ ...current, [field]: value })),
        [],
    );

    const handleSelectUnitChange = useCallback((value) => {
        setSelectedUnits(value);
    }, []);

    const handleSelectAllUnitsClick = () => {
        setSelectedUnits(units);
        setStep(3);
    }
    
    const handleSelectUnitsClick = () => {
        setStep(3);
    }

    const handleReturnStepClick = () => {
        const stepToReturn = step === 2 ? 1 : step === 3 ? 2 : null;
        setStep(() => stepToReturn);
        setSelectedUnits(() => []);
    }

    const toggleOpenConfirmConfigurationModal = () => setOpenModal(value => !value);

    const handleConfiguration = async () => {
        setLoadingConfiguration(true);
        try {
            
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingConfiguration(false);
        }
    }

    return (
        <Page
            title="Paro de motor"
            subtitle="Ciclo de Paro de Motor por puerta"
        >
            <div className="">
                {
                    (step === 1) && (
                        <LegacyCard title="Selecciona un cliente" sectioned>
                            {
                                loadingCustomers ? (
                                    <div className="flex w-full items-center justify-center">
                                        <Spinner accessibilityLabel="Small spinner example" size="small" />
                                    </div>
                                ) : (
                                    <FormLayout>
                                        <Select
                                            label="Cliente:"
                                            options={customers}
                                            onChange={handleSelectChange}
                                            value={customer}
                                            disabled={loadingCustomers}
                                        />
                                        <div className="w-full flex justify-end">
                                            <Button
                                                variant="primary"
                                                icon={SearchIcon}
                                                disabled={loadingCustomers || customers?.length === 0 || !customer}
                                                onClick={handleSearch}
                                            >
                                                Buscar
                                            </Button>
                                        </div>
                                    </FormLayout>
                                )
                            }
                        </LegacyCard>
                    )
                }
                {
                    (step === 2) && (
                        <LegacyCard title="Unidades" sectioned>
                            {
                                loadingUnits ? (
                                    <div className="flex w-full items-center justify-center">
                                        <Spinner accessibilityLabel="Small spinner example" size="small" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-2">
                                            <Button
                                                onClick={handleReturnStepClick}
                                                variant="primary"
                                                icon={ReturnIcon}
                                            ></Button>
                                        </div>
                                        <div className="pb-[250px] flex gap-x-4 items-center">
                                            <div className="flex-1">
                                                <ReactSelect
                                                    onChange={handleSelectUnitChange}
                                                    placeholder="Selecciona unidades"
                                                    options={units}
                                                    isClearable
                                                    isMulti
                                                />
                                            </div>
                                            <div className="flex">
                                                <div className="mx-1">
                                                    <Button
                                                        onClick={handleSelectUnitsClick}
                                                        icon={CheckIcon}
                                                        disabled={
                                                            units?.length === 0 ||
                                                            selectedUnits?.length === 0
                                                        }
                                                    >
                                                        Seleccionar
                                                    </Button>
                                                </div>
                                                <div className="mx-1">
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleSelectAllUnitsClick}
                                                        icon={CheckboxIcon}
                                                    >
                                                        Seleccionar todas
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </LegacyCard>
                    )
                }
                {
                    (step === 3) && (
                        <LegacyCard title="Parámetros" sectioned>
                            <div className="mb-2 w-full flex justify-end">
                                <Button
                                    onClick={handleReturnStepClick}
                                    variant="primary"
                                    icon={ReturnIcon}
                                ></Button>
                            </div>
                            <FormLayout>
                                <Select
                                    label="Tiempo de chattering:"
                                    options={chatteringTimingOptions ?? []}
                                    onChange={(value) => handleParamsChange(value, "chatteringTiming")}
                                    value={configuration.chatteringTiming}
                                />
                                <Select
                                    label="Tiempo 1 de ciclo:"
                                    options={Timing1Options ?? []}
                                    onChange={(value) => handleParamsChange(value, "timing1")}
                                    value={configuration.timing1}
                                />
                                <Select
                                    label="Tiempo 2 de ciclo:"
                                    options={Timing2Options ?? []}
                                    onChange={(value) => handleParamsChange(value, "timing2")}
                                    value={configuration.timing2}
                                />
                                <div className="w-full flex justify-end">
                                    <Button
                                        variant="primary"
                                        icon={SettingsFilledIcon}
                                        onClick={toggleOpenConfirmConfigurationModal}
                                    >
                                        Configurar
                                    </Button>
                                </div>
                            </FormLayout>
                        </LegacyCard>
                    )
                }
            </div>
        {
            openModal && (
                <Modal
                    open={openModal}
                    onClose={toggleOpenConfirmConfigurationModal}
                    title="Configurar unidades"
                    onAction={handleConfiguration}
                    loading={loadingConfiguration}
                    action1Message="Configurar"
                    action2Message="Cancelar"
                    destructive={true}
                    message="¿Estás seguro de configurar estas unidades?"
                />
            )
        }
        </Page>
    );
}