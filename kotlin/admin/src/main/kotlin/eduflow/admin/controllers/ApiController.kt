package eduflow.admin.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
class ApiController {

    @RequestMapping(value = ["/api/**"], method = [RequestMethod.OPTIONS])
    fun handleOptions(): ResponseEntity<Void> {
        return ResponseEntity.ok().build()
    }
}
