/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\src\core\interfaces\IProactiveAssistanceEngine.kt) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\src\core\interfaces\IProactiveAssistanceEngine.kt) */
/* --- dest (C:\Users\chell\Desktop\newsal\src\core\interfaces\IProactiveAssistanceEngine.kt) --- */
/* Merged master for logical file: src\core\interfaces\IProactiveAssistanceEngine
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\src\core\interfaces\IProactiveAssistanceEngine.kt (hash:96EC56AEEFEDAB9175F9DC76DC78E320F84F5C3B1E7DF0095AC16F03EEA262C6)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\src\core\interfaces\IProactiveAssistanceEngine.java (hash:B8CC9732ABCDDF2FB8382E59FAA8A27018783B7DD4309CB993268DEBAF8C48B8)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\src\core\interfaces\IProactiveAssistanceEngine.kt | ext: .kt | sha: 96EC56AEEFEDAB9175F9DC76DC78E320F84F5C3B1E7DF0095AC16F03EEA262C6 ---- */
[BINARY FILE - original copied to merged_sources: src\core\interfaces\IProactiveAssistanceEngine.kt]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\src\core\interfaces\IProactiveAssistanceEngine.java | ext: .java | sha: B8CC9732ABCDDF2FB8382E59FAA8A27018783B7DD4309CB993268DEBAF8C48B8 ---- */
[BINARY FILE - original copied to merged_sources: src\core\interfaces\IProactiveAssistanceEngine.java]
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\src\core\interfaces\IProactiveAssistanceEngine.kt --- */
// Salle Persona: IProactiveAssistanceEngine
package org.sallie.core.interfaces
interface IProactiveAssistanceEngine {
    fun initialize()
    fun loadFromMemory()
    fun saveToMemory()
    fun performTask(taskName: String, context: Map<String, Any>)
    val status: String
}
