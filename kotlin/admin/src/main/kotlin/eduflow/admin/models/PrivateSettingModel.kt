package eduflow.admin.models

import eduflow.privateSetting.*
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.util.*

@Document
data class PrivateSettingModel(
    override val _id: String,
    @Field("type")
    override val type: SettingType,
    override val public: Boolean,
    override val i18nLabel: String,
    override var value: SettingValue,
    override val packageValue: SettingValue,
    override val ts: Date,
    override val createdAt: Date,
    override val options: List<SettingSelectOption>?,
    override val i18nDescription: String?,
    override val enableQuery: EnableQuery? = null,
    override val displayQuery: EnableQuery? = null,
//    override val group: String? = null,
//    override val section: String? = null,
//    override val tab: String? = null,
    override val placeholder: String? = null,
    override val _updatedAt: Date
) : PrivateSetting
