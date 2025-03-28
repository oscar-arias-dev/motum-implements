import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const lsUser = localStorage.getItem("user");
        if (lsUser) {
            setUser(JSON.parse(lsUser));
        }
        setIsAuthChecked(true);
    }, []);

    const login = async (input) => {
        try {
            setLoading(true);
            const response = await fetch('http://motum.ddns.net:8383/cimws/apis/cim/auth', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user: input?.user,
                    password: input?.password,
                }),
            });
            if (!response?.ok) {
                console.error("Error at login");
                return;
            }
            const json = await response?.json();
            setUser(json);
            localStorage.setItem("user", JSON.stringify(json));
            setIsAuthChecked(true);
            navigate("/");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const logOut = () => {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return(
        <AuthContext.Provider
            value={{ user, loading, login, logOut, isAuthChecked }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};