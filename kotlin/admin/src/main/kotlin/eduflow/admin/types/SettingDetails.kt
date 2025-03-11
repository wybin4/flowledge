package eduflow.admin.types

import eduflow.privateSetting.SettingSelectOption
import eduflow.privateSetting.SettingType

data class SettingDetails(
    val id: String? = null,
    val type: SettingType,
    val public: Boolean = false,
    val i18nLabel: String? = null,
    val i18nDescription: String? = null,
    val placeholder: String? = null,
    val options: List<SettingSelectOption>? = listOf(),
)