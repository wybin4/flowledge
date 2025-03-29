import { getFormattedDateWithTime } from "@/helpers/getFormattedDateWithTime"
import { ApiIntegration } from "../types/ApiIntegration"
import { ApiIntegrationTableItem } from "../types/ApiIntegrationTableItem"
import { TFunction } from "i18next"

export const mapApiIntegrationToTable = (integration: ApiIntegration, locale: string, t: TFunction): ApiIntegrationTableItem => {
    return {
        _id: integration._id,
        name: integration.name,
        user: integration.u.username,
        createdAt: getFormattedDateWithTime(integration.createdAt, locale),
        status: integration.enabled ? t('api-integrations.enabled') : t('api-integrations.disabled'),
    }
}