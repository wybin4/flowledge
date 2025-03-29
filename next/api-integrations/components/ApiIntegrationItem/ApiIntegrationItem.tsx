"use client";

import { SettingType, SettingValue } from "@/types/Setting";
import { ApiIntegration } from "../../types/ApiIntegration";
import styles from "./ApiIntegrationItem.module.css";
import { useTranslation } from "react-i18next";
import { SettingWrapper } from "@/components/settings/settingWrapper/SettingWrapper";
import { useEffect, useState } from "react";
import { neuralApiClient } from "@/apiClient";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";
import { useRouter } from "next/navigation";
import { useIcon } from "@/hooks/useIcon";
import cn from "classnames";
import { UpdatableSetting } from "@/hooks/useSettings";
import { useSaveApiIntegration } from "@/api-integrations/hooks/useSaveApiIntegration";
import { useDeleteApiIntegration } from "@/api-integrations/hooks/useDeleteApiIntegration";
import { useGetApiIntegration } from "@/api-integrations/hooks/useGetApiIntegration";

interface ApiIntegrationItemProps {
    _id?: string;
    mode: ApiIntegrationMode;
}

export const ApiIntegrationItem = ({ _id, mode }: ApiIntegrationItemProps) => {
    const { t } = useTranslation();
    const [apiIntegration, setApiIntegration] = useState<ApiIntegration | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ApiIntegration | undefined>(undefined);
    const router = useRouter();
    const iconArrowLeft = useIcon('left');

    const isEditMode = mode === ApiIntegrationMode.EDIT && _id;

    const saveApiIntegration = useSaveApiIntegration(mode, _id);
    const deleteApiIntegration = useDeleteApiIntegration();
    const getApiIntegration = useGetApiIntegration((integration) => {
        setApiIntegration(integration);
        setInitialValues(integration);
    });

    useEffect(() => {
        if (isEditMode) {
            getApiIntegration(_id);
        } else {
            const newIntegration = {
                _id: "",
                name: "",
                secret: "",
                script: "",
                u: {
                    _id: "",
                    username: ""
                },
                createdAt: "",
                updatedAt: "",
                enabled: false
            };
            setApiIntegration(newIntegration);
            setInitialValues(newIntegration);
        }
    }, [_id, mode]);

    const hasChanges = () => {
        if (!initialValues || !apiIntegration) return false;
        return JSON.stringify(initialValues) !== JSON.stringify(apiIntegration);
    };

    if (!apiIntegration) {
        return <div>Loading...</div>;
    }

    const renderSetting = (key: string) => {
        const value = apiIntegration[key as keyof ApiIntegration];
        return {
            setting: {
                _id: key, i18nLabel: `api-integrations.${key}`,
                value,
                packageValue: value,
                type: (() => {
                    switch (key) {
                        case 'name':
                            return SettingType.InputText;
                        case 'secret':
                            return SettingType.InputPassword;
                        case 'script':
                            return SettingType.Code;
                        case 'enabled':
                            return SettingType.Radio;
                        default:
                            return SettingType.InputText;
                    }
                })()
            } as SettingValue
        };
    };

    const handleSave = (setting: UpdatableSetting) => {
        setApiIntegration((prev) => {
            if (!prev) return prev;
            return { ...prev, [setting.id]: setting.value };
        });
    };

    const renderSettings = () => {
        const settings = [
            renderSetting('enabled'),
            renderSetting('name'),
            renderSetting('secret'),
            renderSetting('script')
        ];

        return settings.map(({ setting }, index) => (
            <SettingWrapper key={index} setting={setting} handleSave={(newValue) => {
                handleSave({ id: setting._id, value: newValue.value });
            }} />
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.backButton} onClick={() => router.back()}>
                {iconArrowLeft} {t('back')}
            </div>
            <div className={styles.body}>
                <h2 className={styles.title}>{mode === ApiIntegrationMode.CREATE ? t('api-integrations.create') : t('api-integrations.edit')}</h2>
                <div className={styles.settingsContainer}>
                    {renderSettings()}
                </div>
                <div className={styles.buttonContainer}>
                    {isEditMode &&
                        <button className={cn(styles.button, styles.deleteButton)} onClick={() => deleteApiIntegration(_id)}>
                            {t('api-integrations.delete')}
                        </button>
                    }
                    {hasChanges() && apiIntegration &&
                        <button
                            className={cn(styles.button, styles.saveButton)}
                            onClick={() => saveApiIntegration(apiIntegration)}
                        >
                            {t('api-integrations.save')}
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};