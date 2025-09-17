package flowledge.admin.models

import flowledge.user.Language
import flowledge.user.Theme
import flowledge.user_model.UserSetting
import org.springframework.data.mongodb.core.mapping.Field

data class UserSettingModel(
    @Field("theme")
    override var theme: Theme,
    @Field("language")
    override var language: Language
): UserSetting