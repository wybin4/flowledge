package eduflow.admin.dto

import eduflow.privateSetting.SettingValue

data class SettingUpdateRequest(
    val id: String,
    val value: SettingValue,
)