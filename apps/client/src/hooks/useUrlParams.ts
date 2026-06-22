import { useLocation, useNavigate } from "@solidjs/router"

type RemoveUrlParamOptions = {
    replace?: boolean
    scroll?: boolean
}

export function useUrlParams() {
    const location = useLocation()
    const navigate = useNavigate()

    const currentParams = () => new URLSearchParams(location.search)

    const getParam = (name: string) => currentParams().get(name)
    const getParams = (name: string) => currentParams().getAll(name)

    const removeParam = (name: string, options: RemoveUrlParamOptions = {}) => {
        const nextParams = currentParams()

        if (!nextParams.has(name)) return

        nextParams.delete(name)

        const nextSearch = nextParams.toString()
        const nextUrl = `${location.pathname}${nextSearch ? `?${nextSearch}` : ""}${location.hash}`

        navigate(nextUrl, {
            replace: true,
            scroll: false,
            ...options
        })
    }

    return {
        getParam,
        getParams,
        removeParam
    }
}
