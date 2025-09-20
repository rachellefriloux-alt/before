package core.data.repository

import core.data.model.UserState

class UserStateRepository {
    private var userState: UserState? = null

    fun setUserState(state: UserState) {
        userState = state
    }

    fun getUserState(): UserState? = userState
}
