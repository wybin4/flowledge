"use client";

import { SettingType, SettingValue } from "@/types/Setting";
import { ApiIntegration } from "../../types/ApiIntegration";
import styles from "./ApiIntegrationItem.module.css";
import { useTranslation } from "react-i18next";
import { SettingWrapper } from "@/components/settings/settingWrapper/SettingWrapper";
import { useEffect, useState } from "react";
import { neuralApiClient } from "@/apiClient";
import { ApiIntegrationMode } from "@/api-integrations/types/ApiIntegrationMode";

interface ApiIntegrationItemProps {
    _id?: string;
    mode: ApiIntegrationMode;
}

export const ApiIntegrationItem = ({ _id, mode }: ApiIntegrationItemProps) => {
    const { t } = useTranslation();
    const [apiIntegration, setApiIntegration] = useState<ApiIntegration | undefined>(undefined);

    const saveApiIntegration = async () => {
        const method = mode === ApiIntegrationMode.CREATE ? 'POST' : 'PUT';
        const url = mode === ApiIntegrationMode.CREATE ? 'api-integrations' : `api-integrations/${_id}`;
        console.log(apiIntegration);
        await neuralApiClient<ApiIntegration>(url, {
            method,
            body: JSON.stringify(apiIntegration)
        });
    };

    useEffect(() => {
        if (mode === ApiIntegrationMode.EDIT && _id) {
            const getApiIntegration = async () => {
                const apiIntegration = await neuralApiClient<ApiIntegration>(`api-integrations/${_id}`);
                setApiIntegration(apiIntegration);
            };

            getApiIntegration();
        } else {
            setApiIntegration({
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
            });
        }
    }, [_id, mode]);

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

    const renderSettings = () => {
        const settings = [
            renderSetting('enabled'),
            renderSetting('name'),
            renderSetting('secret'),
            renderSetting('script')
        ];

        return settings.map(({ setting }, index) => (
            <SettingWrapper key={index} setting={setting} handleSave={(newValue) => {
                // Обновляем значение в apiIntegration
                setApiIntegration((prev) => ({
                    ...prev,
                    [setting._id]: newValue.value
                }));
            }} />
        ));
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{mode === ApiIntegrationMode.CREATE ? t('api-integrations.create') : t('api-integrations.edit')}</h2>
            <div className={styles.settingsContainer}>
                {renderSettings()}
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.saveButton} onClick={saveApiIntegration}>{t('api-integrations.save')}</button>
            </div>
        </div>
    );
};