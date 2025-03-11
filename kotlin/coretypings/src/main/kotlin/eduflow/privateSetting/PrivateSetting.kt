package eduflow.privateSetting

import eduflow.Record
import java.util.*

typealias SettingValue = Any

interface PrivateSetting: Record {
    val type: SettingType
    val public: Boolean
//    val group: String? get() = null
//    val section: String? get() = null
//    val tab: String? get() = null
    val i18nLabel: String
    val value: SettingValue
    val packageValue: SettingValue
    val enableQuery: EnableQuery? get() = null
    val displayQuery: EnableQuery? get() = null
    val i18nDescription: String? get() = null
    val ts: Date
    val createdAt: Date
    val options: List<SettingSelectOption>? get() = null
    val placeholder: String? get() = null
}