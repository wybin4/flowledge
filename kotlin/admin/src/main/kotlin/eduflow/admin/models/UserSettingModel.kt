package eduflow.admin.models

import eduflow.user.Language
import eduflow.user.Theme
import eduflow.user.UserSetting
import org.springframework.data.mongodb.core.mapping.Field

data class UserSettingModel(
    @Field("theme")
    override var theme: Theme,
    @Field("language")
    override var language: Language
): UserSetting