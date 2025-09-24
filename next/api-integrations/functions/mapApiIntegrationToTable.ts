import { getFormattedDateWithTime } from "@/helpers/getFormattedDateWithTime"
import { ApiIntegration } from "../types/ApiIntegration"
import { ApiIntegrationTableItem } from "../types/ApiIntegrationTableItem"
import { TFunction } from "i18next"
import { apiIntegrationsPrefix } from "@/helpers/prefixes"

export const mapApiIntegrationToTable = (integration: ApiIntegration, locale: string, t: TFunction): ApiIntegrationTableItem => {
    return {
        id: integration.id,
        title: integration.name,
        user: integration.u.username,
        createdAt: getFormattedDateWithTime(integration.createdAt, locale),
        entity: t(`${apiIntegrationsPrefix}.${integration.entity}`),
        status: integration.enabled ? t(`${apiIntegrationsPrefix}.enabled`) : t(`${apiIntegrationsPrefix}.disabled`),
    }
}