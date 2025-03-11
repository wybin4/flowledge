package eduflow.admin.controllers

import eduflow.admin.models.PrivateSettingModel
import eduflow.admin.repositories.PrivateSettingRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api")
class SettingController(private val privateSettingRepository: PrivateSettingRepository) {

    @GetMapping("/private-settings.get")
    fun getPrivateSettings(): Flux<PrivateSettingModel> {
        return privateSettingRepository.findAll()
    }

    @GetMapping("/public-settings.get")
    fun getPublicSettings(): Flux<PrivateSettingModel> {
        return privateSettingRepository.findAll().filter { it.public }
    }

}
