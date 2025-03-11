package eduflow.admin.dto

import eduflow.privateSetting.SettingValue

data class SettingsUpdateRequest(
    val id: String,
    val value: SettingValue,
)