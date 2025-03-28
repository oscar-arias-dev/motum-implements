import { useState } from "react";
import { useNavigate } from "react-router";
import { FormLayout, LegacyCard, Page, TextField, Button, Text } from "@shopify/polaris";
import { useAuth } from "../../context/AuthProvider";
import { useEffect } from "react";
import MotumLogo from "./../../assets/motum.png";

export default function Login() {
    const navigate = useNavigate();
    const auth = useAuth();
    const loading = auth.loading;

    const [input, setInput] = useState({
        user: "",
        password: "",
    });

    useEffect(() => {
        if (auth?.user && auth?.isAuthChecked) {
            navigate("/");
        }
    }, []);

    const handleInput = (field, value) => {
        setInput((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLoginClick = async () => {
        await auth.login(input);
    }
    
    return (
        <Page>
            <LegacyCard sectioned>
                <div className="flex justify-between">
                    <Text variant="headingXl" as="h4">
                        Motum implementaciones
                    </Text>
                    <img width={50} height={35} src={MotumLogo} alt="motum" />
                </div>
            </LegacyCard>
            <LegacyCard title="Inicia sesión" sectioned>
                <FormLayout>
                    <TextField
                        onChange={v => handleInput("user", v)}
                        value={input.user}
                        label="Nombre de usuario:"
                    />
                    <TextField
                        onChange={v => handleInput("password", v)}
                        value={input.password}
                        label="Contraseña:"
                        type="password"
                        autoComplete="off"
                    />
                    <Button
                        disabled={
                            loading || !input.user || !input.password
                        }
                        variant="primary"
                        onClick={handleLoginClick}
                        loading={loading}
                    >
                        Ingresar
                    </Button>
                </FormLayout>
            </LegacyCard>
        </Page>
    );
}