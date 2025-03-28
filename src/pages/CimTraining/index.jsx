import { useState, useEffect } from "react";
import {
    Page,
} from "@shopify/polaris";
import dayjs from "dayjs";
import TrainingTable from "./components/TrainingTable";
import TrainingDetailsModal from "./components/TrainingDetailsModal";

const URL = 'https://secure.tecnomotum.com/bcim/training-api.php';

export default function CimTraining() {
    const [upcomingTraining, setUpcomingTrainings] = useState([]);
    const [endedTraining, setEndedTrainings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [training, setTraining] = useState(null);

    useEffect(() => {
        handleFetchTrainings();
    }, []);

    const handleFetchTrainings = async () => {
        try {
            setLoading(true);
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    api: "trainings"
                }),
            });
            if (!response?.ok) {
                console.error("Error retrieving trainings");
                return;
            }
            const json = await response?.json();
            if (!json || !Array.isArray(json)) {
                console.error("Bad Response");
                return;
            }
            const now = dayjs();
            const endedFiltered = json?.filter(entry => {
                const elementDate = dayjs(entry.date);
                return elementDate.isBefore(now);
            }) ?? [];
            const upcomingFiltered = json?.filter(entry => {
                const elementDate = dayjs(entry.date);
                return elementDate.isAfter(now);
            }) ?? [];
            setEndedTrainings(endedFiltered);
            setUpcomingTrainings(upcomingFiltered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (training) => {
        setTraining(training);
        setOpen(true);
    };

    const handleTrainingDetailsModalClose = () => {
        setTraining(null);
        setOpen(false);
    }

    return (
        <div className="flex">
            <Page
                fullWidth
                title="Pendientes"
            >
                <TrainingTable
                    type="upcoming"
                    data={upcomingTraining ?? []}
                    loading={loading}
                    onOpen={handleOpenModal}
                />
            </Page>
            <Page
                fullWidth
                title="Concluidas"
            >
                <TrainingTable
                    type="ended"
                    data={endedTraining ?? []}
                    loading={loading}
                    onOpen={handleOpenModal}
                />
            </Page>
            {
                (open) && (
                    <TrainingDetailsModal
                        open={open}
                        onClose={handleTrainingDetailsModalClose}
                        training={training}
                    />
                )
            }
        </div>
    );
}