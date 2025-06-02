package flowledge.admin.utils

import java.util.*

fun Any.generateId(): String {
    return UUID.randomUUID().toString()
}