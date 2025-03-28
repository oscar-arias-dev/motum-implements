import { Modal as SpModal } from "@shopify/polaris";

export default function Modal({
    open,
    onClose,
    title,
    onAction,
    loading,
    action1Message,
    action2Message,
    destructive,
    message,
 }) {
    return (
        <SpModal
            open={open}
            onClose={() => {
                if (loading) return;
                onClose();
            }}
            title={title}
            primaryAction={{
                destructive: destructive,
                content: action1Message,
                onAction: onAction,
                loading: loading,
            }}
            secondaryActions={[
                {
                    content: action2Message,
                    onAction: onClose,
                    loading: loading,
                },
            ]}
        >
            <SpModal.Section>
                {message}
            </SpModal.Section>
        </SpModal>
    );
}