import { useState, useCallback, useMemo } from 'react';
import {
    Tag,
    Listbox,
    Combobox,
    Icon,
    TextContainer,
    LegacyStack,
    AutoSelection,
    FormLayout,
    TextField,
    Button,
    Divider,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

export default function Events({ report, onSetTests, onAddDetails, onDeleteDetails }) {
    const { tests } = report ?? null;
    const deselectedOptions = useMemo(
        () => [
            { value: "Botón de Pánico", label: "Botón de Pánico" },
            { value: "Botón de Asistencia", label: "Botón de Asistencia" },
            { value: "Paro de Motor", label: "Paro de Motor" },
            { value: "Paro de Motor por Jammer", label: "Paro de Motor por Jammer" },
            { value: "Paro de Motor por Antitamper", label: "Paro de Motor por Antitamper" },
            { value: "Ciclo de Jammer", label: "Ciclo de Jammer" },
        ],
        [],
    );

    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(deselectedOptions);
    const [newTest, setNewTest] = useState("");

    const handleAddNewTestClick = () => {
        if (!newTest) return;
        onAddDetails(newTest);
        onSetTests([...tests, newTest]);
        setNewTest('');
    }

    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    const updateText = useCallback(
        (value) => {
            setInputValue(value);

            if (value === '') {
                setOptions(deselectedOptions);
                return;
            }

            const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');
            const resultOptions = deselectedOptions.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptions(resultOptions);
        },
        [deselectedOptions, escapeSpecialRegExCharacters],
    );

    const updateSelection = useCallback(
        (selected) => {
            if (tests.includes(selected)) {
                onSetTests(
                    tests.filter((option) => option !== selected),
                );
            } else {
                onAddDetails(selected);
                onSetTests([...tests, selected]);
            }

            updateText('');
        },
        [tests, updateText],
    );

    const removeTag = useCallback(
        (tag) => () => {
            onDeleteDetails(tag);
            const options = [...tests];
            options.splice(options.indexOf(tag), 1);
            onSetTests(options);
        },
        [tests],
    );

    const tagsMarkup = tests.map((option) => (
        <Tag key={`option-${option}`} onRemove={removeTag(option)}>
            {option}
        </Tag>
    ));

    const optionsMarkup =
        options.length > 0
            ? options.map((option) => {
                const { label, value } = option;

                return (
                    <Listbox.Option
                        key={`${value}`}
                        value={value}
                        selected={tests.includes(value)}
                        accessibilityLabel={label}
                    >
                        {label}
                    </Listbox.Option>
                );
            })
            : null;

    return (
        <>
            <div>
                <Combobox
                    allowMultiple
                    activator={
                        <Combobox.TextField
                            prefix={<Icon source={SearchIcon} />}
                            onChange={updateText}
                            label="Pruebas"
                            labelHidden
                            value={inputValue}
                            placeholder="Pruebas"
                            autoComplete="off"
                        />
                    }
                >
                    {optionsMarkup ? (
                        <Listbox
                            autoSelection={AutoSelection.None}
                            onSelect={updateSelection}
                        >
                            {optionsMarkup}
                        </Listbox>
                    ) : null}
                </Combobox>
                <div className='mt-2'>
                    <TextContainer>
                        <LegacyStack>{tagsMarkup}</LegacyStack>
                    </TextContainer>
                </div>
            </div>
            <div className='my-8'>
                <Divider borderColor="border-inverse" />
            </div>
            <div className='mt-6'>
                <p><b>Añade una prueba nueva</b></p>
                <FormLayout>
                    <TextField label="Prueba nueva:" value={newTest} onChange={setNewTest} placeholder='Prueba' />
                    <Button onClick={handleAddNewTestClick} disabled={!newTest}>Añadir</Button>
                </FormLayout>
            </div>
        </>
    );
}