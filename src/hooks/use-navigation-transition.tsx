import { useNavigate } from "react-router-dom";

export const useNavigationTransition = () => {
    const navigate = useNavigate();

    const navigateWithTransition = (to: string) => {
        navigate(to);
    };

    return { navigateWithTransition };
};
