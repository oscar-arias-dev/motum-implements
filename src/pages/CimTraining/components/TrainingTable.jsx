import { useState, useEffect } from 'react';
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Badge,
    useBreakpoints,
} from '@shopify/polaris';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const resourceName = {
    singular: 'certificación',
    plural: 'certificaciones',
};
const itemsPerPage = 10;

export default function TrainingTable({ type, data, loading, onOpen }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedData, setPaginatedData] = useState([]);

    useEffect(() => {
        if (data) {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setPaginatedData(data?.slice(startIndex, endIndex));
        }
    }, [currentPage, data, itemsPerPage]);

    const totalPages = Math.ceil(paginatedData?.length / itemsPerPage) || 1;

    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
        useIndexResourceState(paginatedData);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleDetailsClick = () => {
        const findedTraining = data?.find(current => current?.id === selectedResources[0]) ?? null;
        onOpen({
            ...findedTraining,
            type,
        });
        clearSelection();
    }

    const handleSendToVideocall = () => {
        const findedTraining = data?.find(current => current?.id === selectedResources[0]) ?? null;
        const currentLink = findedTraining?.link ?? "";
        if (currentLink) {
            window.open(currentLink, "_blank", "noopener,noreferrer");
        } else {
            console.warn("No hay un enlace disponible.");
        }
    }

    const rowMarkup = paginatedData?.map(
        (
            { id, date, link, total_enrollments },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources?.includes(id)}
                position={index}
            >
                <IndexTable.Cell>{id}</IndexTable.Cell>
                <IndexTable.Cell><b>{dayjs(date)?.format('dddd') ?? "~"}</b></IndexTable.Cell>
                <IndexTable.Cell>{dayjs(date)?.format('DD/MM/YYYY') ?? "~"}</IndexTable.Cell>
                <IndexTable.Cell>
                <Badge
                    tone="success"
                >
                    <b>{total_enrollments}</b>
                </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell><i>{link?.split("google.com")?.[1] ?? "~"}</i></IndexTable.Cell>
            </IndexTable.Row>
        ),
    ) ?? [];

    const promotedBulkActions = [
        {
            content: 'Detalles',
            onAction: handleDetailsClick,
            disabled: selectedResources?.length > 1,
        },
        {
            content: 'Videollamada',
            onAction: handleSendToVideocall,
            disabled: selectedResources?.length > 1,
        },
    ];

    return (
        <LegacyCard>
            <IndexTable
                resourceName={resourceName}
                itemCount={data?.length ?? 0}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources?.length
                }
                onSelectionChange={(x, y, z) => {
                    clearSelection();
                    handleSelectionChange(x, y, z);
                }}
                headings={[
                    { title: 'ID' },
                    { title: 'Día' },
                    { title: 'Fecha' },
                    { title: 'Inscritos' },
                    { title: 'Link' },
                ]}
                promotedBulkActions={promotedBulkActions}
                pagination={{
                    hasPrevious: currentPage > 1,
                    onPrevious: handlePrevious,
                    hasNext: currentPage < totalPages,
                    onNext: handleNext,
                }}
                loading={loading ?? false}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
}