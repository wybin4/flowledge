package flowledge.admin.controllers

import flowledge.admin.dto.SettingUpdateRequest
import flowledge.admin.models.PrivateSettingModel
import flowledge.admin.repositories.PrivateSettingRepository
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class SettingController(private val privateSettingRepository: PrivateSettingRepository) {

    @GetMapping("/private-settings.get")
    fun getPrivateSettings(): Flux<PrivateSettingModel> {
        return privateSettingRepository.findAll()
    }

    @PostMapping("/settings.set")
    fun setSettings(@RequestBody request: SettingUpdateRequest): Mono<PrivateSettingModel> {
        return privateSettingRepository.findById(request.id)
            .flatMap { existingSetting ->
                existingSetting.value = request.value
                privateSettingRepository.save(existingSetting)
            }
    }

    @GetMapping("/public-settings.get")
    fun getPublicSettings(): Flux<PrivateSettingModel> {
        return privateSettingRepository.findAll().filter { it.public }
    }

}
