package flowledge.admin.types

import flowledge.privateSetting.SettingSelectOption
import flowledge.privateSetting.SettingType

data class SettingDetails(
    val id: String? = null,
    val type: SettingType,
    val public: Boolean = false,
    val i18nLabel: String? = null,
    val i18nDescription: String? = null,
    val placeholder: String? = null,
    val options: List<SettingSelectOption>? = listOf(),
)