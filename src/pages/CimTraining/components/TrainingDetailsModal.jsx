import { useEffect, useState } from 'react';
import {
    Modal,
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Icon,
    Badge,
} from '@shopify/polaris';
import {
    CheckIcon,
    ClockIcon,
  } from '@shopify/polaris-icons';
import dayjs from 'dayjs';
import { useToast } from '../../../components/Toast';

const URL = 'https://secure.tecnomotum.com/bcim/training-api.php';
const resourceName = {
    singular: 'participante',
    plural: 'participantes',
};

export default function TrainingDetailsModal({ open, onClose, training }) {
    const { showToast } = useToast();

    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingParticipantAction, setLoadingParticipantAction] = useState(false);

    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
        useIndexResourceState(participants ?? []);

    useEffect(() => {
        handleRetrieveParticipants();
    }, []);

    useEffect(() => {
        const findedParticipant = participants?.find(current => `${current?.id_training}-${current?.id_participant}` === selectedResources?.[0]) ?? null;
        setSelectedParticipant(findedParticipant);
    }, [selectedResources]);

    const handleRetrieveParticipants = async () => {
        try {
            setLoading(true);
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    api: "trainings_participants",
                    id_training: training?.id ?? "",
                }),
            });
            if (!response?.ok) {
                console.error("Error retrieving participants");
                return;
            }
            const json = await response?.json();
            if (!json || !Array?.isArray(json)) {
                console.error("Response without participants");
                return;
            }
            setParticipants(json ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSelectParticipant = async () =>
        await ((training?.type === "upcoming" || (selectedParticipant?.attended === "1" || selectedParticipant?.attended === 1)) ? handleResendEmail() : handleConfirmAttend());

    const handleResendEmail = async () => {
        try {
            setLoadingParticipantAction(true);
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    api: "resend_email",
                    email: selectedParticipant?.email,
                    fullname: selectedParticipant?.fullname,
                    date: training?.date,
                    day: dayjs(training?.date)?.day(),
                    platform: selectedParticipant?.platform,
                }),
            });
            if (!response?.ok) {
                console.error("Error sending email");
                return;
            }
            const json = await response?.json();
            clearSelection();
            showToast("Email reenviado");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingParticipantAction(false);
        }
    }

    const handleConfirmAttend = async () => {
        try {
            setLoadingParticipantAction(true);
            const response = await fetch('https://secure.tecnomotum.com/bcim/training-api.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    training_id: selectedParticipant?.id_training,
                    participant_id: selectedParticipant?.id_participant,
                }),
            });
            if (!response?.ok) {
                console.error("Error at confirm attend");
                return;
            }
            const json = await response?.json();
            await handleRetrieveParticipants();
            clearSelection();
            showToast("Asistencia confirmada");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingParticipantAction(false);
        }
    }

    const promotedBulkActions = [
        {
            content: `${training?.type === "upcoming" ? "Reenviar invitación" : "Asistencia"}`,
            onAction: handleSelectParticipant,
            loading: loadingParticipantAction,
            disabled: loadingParticipantAction || (training?.type === "ended" && (selectedParticipant?.attended === "1" || selectedParticipant?.attended === 1)),
        },
    ];

    const rowMarkup = participants?.map(
        (
            { id_training, id_participant, attended, created_at, fullname, email, phone_number, whatsapp, platform, customer, },
            index,
        ) => (
            <IndexTable.Row
                id={`${id_training}-${id_participant}`}
                key={`${id_training}-${id_participant}`}
                selected={selectedResources.includes(`${id_training}-${id_participant}`)}
                position={index}
                disabled={(attended === "1" || attended === 1)}
            >
                <IndexTable.Cell>{fullname}</IndexTable.Cell>
                <IndexTable.Cell>{customer ?? "~"}</IndexTable.Cell>
                <IndexTable.Cell>{platform ?? "~"}</IndexTable.Cell>
                <IndexTable.Cell>{email}</IndexTable.Cell>
                <IndexTable.Cell>{phone_number}</IndexTable.Cell>
                <IndexTable.Cell>{dayjs(created_at)?.format('DD/MM/YYYY')}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge
                        tone={(training?.type === "upcoming" || (attended === "1" || attended === 1)) ? "success" : ""}
                    >
                        <Icon
                            source={(training?.type === "upcoming" || (attended === "1" || attended === 1)) ? CheckIcon : ClockIcon}
                        />
                    </Badge>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    ) ?? [];

    return (
        <Modal
            size="large"
            open={open}
            onClose={() => {
                if (loadingParticipantAction) return;
                onClose();
            }}
            title="Detalles de la capacitación"
            secondaryActions={[
                {
                    content: 'Cerrar',
                    onAction: onClose,
                    loading: loadingParticipantAction,
                    disabled: loadingParticipantAction,
                },
            ]}
        >
            <Modal.Section>
                <LegacyCard>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={participants?.length ?? 0}
                        selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources?.length
                        }
                        onSelectionChange={(x, y, z) => {
                            clearSelection();
                            handleSelectionChange(x, y, z);
                        }}
                        headings={[
                            { title: 'Nombre' },
                            { title: 'Cliente' },
                            { title: 'Plataforma' },
                            { title: 'Email' },
                            { title: 'Teléfono' },
                            { title: 'Fecha de inscripción' },
                            { title: `${training?.type === "upcoming" ? "Enviada" : "Asistió"}` },
                        ]}
                        promotedBulkActions={promotedBulkActions}
                        loading={loading}
                    >
                        {rowMarkup}
                    </IndexTable>
                </LegacyCard>
            </Modal.Section>
        </Modal>
    );
}