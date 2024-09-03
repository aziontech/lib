There is a new version of Azion CLI available
Visit https://github.com/aziontech/azion/releases to download the correct packagePlease run: 'sudo dpkg -i <downloaded_file>' to update it to v1.36.1
# bash completion for azion                                -*- shell-script -*-

__azion_debug()
{
    if [[ -n ${BASH_COMP_DEBUG_FILE:-} ]]; then
        echo "$*" >> "${BASH_COMP_DEBUG_FILE}"
    fi
}

# Homebrew on Macs have version 1.3 of bash-completion which doesn't include
# _init_completion. This is a very minimal version of that function.
__azion_init_completion()
{
    COMPREPLY=()
    _get_comp_words_by_ref "$@" cur prev words cword
}

__azion_index_of_word()
{
    local w word=$1
    shift
    index=0
    for w in "$@"; do
        [[ $w = "$word" ]] && return
        index=$((index+1))
    done
    index=-1
}

__azion_contains_word()
{
    local w word=$1; shift
    for w in "$@"; do
        [[ $w = "$word" ]] && return
    done
    return 1
}

__azion_handle_go_custom_completion()
{
    __azion_debug "${FUNCNAME[0]}: cur is ${cur}, words[*] is ${words[*]}, #words[@] is ${#words[@]}"

    local shellCompDirectiveError=1
    local shellCompDirectiveNoSpace=2
    local shellCompDirectiveNoFileComp=4
    local shellCompDirectiveFilterFileExt=8
    local shellCompDirectiveFilterDirs=16

    local out requestComp lastParam lastChar comp directive args

    # Prepare the command to request completions for the program.
    # Calling ${words[0]} instead of directly azion allows handling aliases
    args=("${words[@]:1}")
    # Disable ActiveHelp which is not supported for bash completion v1
    requestComp="AZION_ACTIVE_HELP=0 ${words[0]} __completeNoDesc ${args[*]}"

    lastParam=${words[$((${#words[@]}-1))]}
    lastChar=${lastParam:$((${#lastParam}-1)):1}
    __azion_debug "${FUNCNAME[0]}: lastParam ${lastParam}, lastChar ${lastChar}"

    if [ -z "${cur}" ] && [ "${lastChar}" != "=" ]; then
        # If the last parameter is complete (there is a space following it)
        # We add an extra empty parameter so we can indicate this to the go method.
        __azion_debug "${FUNCNAME[0]}: Adding extra empty parameter"
        requestComp="${requestComp} \"\""
    fi

    __azion_debug "${FUNCNAME[0]}: calling ${requestComp}"
    # Use eval to handle any environment variables and such
    out=$(eval "${requestComp}" 2>/dev/null)

    # Extract the directive integer at the very end of the output following a colon (:)
    directive=${out##*:}
    # Remove the directive
    out=${out%:*}
    if [ "${directive}" = "${out}" ]; then
        # There is not directive specified
        directive=0
    fi
    __azion_debug "${FUNCNAME[0]}: the completion directive is: ${directive}"
    __azion_debug "${FUNCNAME[0]}: the completions are: ${out}"

    if [ $((directive & shellCompDirectiveError)) -ne 0 ]; then
        # Error code.  No completion.
        __azion_debug "${FUNCNAME[0]}: received error from custom completion go code"
        return
    else
        if [ $((directive & shellCompDirectiveNoSpace)) -ne 0 ]; then
            if [[ $(type -t compopt) = "builtin" ]]; then
                __azion_debug "${FUNCNAME[0]}: activating no space"
                compopt -o nospace
            fi
        fi
        if [ $((directive & shellCompDirectiveNoFileComp)) -ne 0 ]; then
            if [[ $(type -t compopt) = "builtin" ]]; then
                __azion_debug "${FUNCNAME[0]}: activating no file completion"
                compopt +o default
            fi
        fi
    fi

    if [ $((directive & shellCompDirectiveFilterFileExt)) -ne 0 ]; then
        # File extension filtering
        local fullFilter filter filteringCmd
        # Do not use quotes around the $out variable or else newline
        # characters will be kept.
        for filter in ${out}; do
            fullFilter+="$filter|"
        done

        filteringCmd="_filedir $fullFilter"
        __azion_debug "File filtering command: $filteringCmd"
        $filteringCmd
    elif [ $((directive & shellCompDirectiveFilterDirs)) -ne 0 ]; then
        # File completion for directories only
        local subdir
        # Use printf to strip any trailing newline
        subdir=$(printf "%s" "${out}")
        if [ -n "$subdir" ]; then
            __azion_debug "Listing directories in $subdir"
            __azion_handle_subdirs_in_dir_flag "$subdir"
        else
            __azion_debug "Listing directories in ."
            _filedir -d
        fi
    else
        while IFS='' read -r comp; do
            COMPREPLY+=("$comp")
        done < <(compgen -W "${out}" -- "$cur")
    fi
}

__azion_handle_reply()
{
    __azion_debug "${FUNCNAME[0]}"
    local comp
    case $cur in
        -*)
            if [[ $(type -t compopt) = "builtin" ]]; then
                compopt -o nospace
            fi
            local allflags
            if [ ${#must_have_one_flag[@]} -ne 0 ]; then
                allflags=("${must_have_one_flag[@]}")
            else
                allflags=("${flags[*]} ${two_word_flags[*]}")
            fi
            while IFS='' read -r comp; do
                COMPREPLY+=("$comp")
            done < <(compgen -W "${allflags[*]}" -- "$cur")
            if [[ $(type -t compopt) = "builtin" ]]; then
                [[ "${COMPREPLY[0]}" == *= ]] || compopt +o nospace
            fi

            # complete after --flag=abc
            if [[ $cur == *=* ]]; then
                if [[ $(type -t compopt) = "builtin" ]]; then
                    compopt +o nospace
                fi

                local index flag
                flag="${cur%=*}"
                __azion_index_of_word "${flag}" "${flags_with_completion[@]}"
                COMPREPLY=()
                if [[ ${index} -ge 0 ]]; then
                    PREFIX=""
                    cur="${cur#*=}"
                    ${flags_completion[${index}]}
                    if [ -n "${ZSH_VERSION:-}" ]; then
                        # zsh completion needs --flag= prefix
                        eval "COMPREPLY=( \"\${COMPREPLY[@]/#/${flag}=}\" )"
                    fi
                fi
            fi

            if [[ -z "${flag_parsing_disabled}" ]]; then
                # If flag parsing is enabled, we have completed the flags and can return.
                # If flag parsing is disabled, we may not know all (or any) of the flags, so we fallthrough
                # to possibly call handle_go_custom_completion.
                return 0;
            fi
            ;;
    esac

    # check if we are handling a flag with special work handling
    local index
    __azion_index_of_word "${prev}" "${flags_with_completion[@]}"
    if [[ ${index} -ge 0 ]]; then
        ${flags_completion[${index}]}
        return
    fi

    # we are parsing a flag and don't have a special handler, no completion
    if [[ ${cur} != "${words[cword]}" ]]; then
        return
    fi

    local completions
    completions=("${commands[@]}")
    if [[ ${#must_have_one_noun[@]} -ne 0 ]]; then
        completions+=("${must_have_one_noun[@]}")
    elif [[ -n "${has_completion_function}" ]]; then
        # if a go completion function is provided, defer to that function
        __azion_handle_go_custom_completion
    fi
    if [[ ${#must_have_one_flag[@]} -ne 0 ]]; then
        completions+=("${must_have_one_flag[@]}")
    fi
    while IFS='' read -r comp; do
        COMPREPLY+=("$comp")
    done < <(compgen -W "${completions[*]}" -- "$cur")

    if [[ ${#COMPREPLY[@]} -eq 0 && ${#noun_aliases[@]} -gt 0 && ${#must_have_one_noun[@]} -ne 0 ]]; then
        while IFS='' read -r comp; do
            COMPREPLY+=("$comp")
        done < <(compgen -W "${noun_aliases[*]}" -- "$cur")
    fi

    if [[ ${#COMPREPLY[@]} -eq 0 ]]; then
        if declare -F __azion_custom_func >/dev/null; then
            # try command name qualified custom func
            __azion_custom_func
        else
            # otherwise fall back to unqualified for compatibility
            declare -F __custom_func >/dev/null && __custom_func
        fi
    fi

    # available in bash-completion >= 2, not always present on macOS
    if declare -F __ltrim_colon_completions >/dev/null; then
        __ltrim_colon_completions "$cur"
    fi

    # If there is only 1 completion and it is a flag with an = it will be completed
    # but we don't want a space after the =
    if [[ "${#COMPREPLY[@]}" -eq "1" ]] && [[ $(type -t compopt) = "builtin" ]] && [[ "${COMPREPLY[0]}" == --*= ]]; then
       compopt -o nospace
    fi
}

# The arguments should be in the form "ext1|ext2|extn"
__azion_handle_filename_extension_flag()
{
    local ext="$1"
    _filedir "@(${ext})"
}

__azion_handle_subdirs_in_dir_flag()
{
    local dir="$1"
    pushd "${dir}" >/dev/null 2>&1 && _filedir -d && popd >/dev/null 2>&1 || return
}

__azion_handle_flag()
{
    __azion_debug "${FUNCNAME[0]}: c is $c words[c] is ${words[c]}"

    # if a command required a flag, and we found it, unset must_have_one_flag()
    local flagname=${words[c]}
    local flagvalue=""
    # if the word contained an =
    if [[ ${words[c]} == *"="* ]]; then
        flagvalue=${flagname#*=} # take in as flagvalue after the =
        flagname=${flagname%=*} # strip everything after the =
        flagname="${flagname}=" # but put the = back
    fi
    __azion_debug "${FUNCNAME[0]}: looking for ${flagname}"
    if __azion_contains_word "${flagname}" "${must_have_one_flag[@]}"; then
        must_have_one_flag=()
    fi

    # if you set a flag which only applies to this command, don't show subcommands
    if __azion_contains_word "${flagname}" "${local_nonpersistent_flags[@]}"; then
      commands=()
    fi

    # keep flag value with flagname as flaghash
    # flaghash variable is an associative array which is only supported in bash > 3.
    if [[ -z "${BASH_VERSION:-}" || "${BASH_VERSINFO[0]:-}" -gt 3 ]]; then
        if [ -n "${flagvalue}" ] ; then
            flaghash[${flagname}]=${flagvalue}
        elif [ -n "${words[ $((c+1)) ]}" ] ; then
            flaghash[${flagname}]=${words[ $((c+1)) ]}
        else
            flaghash[${flagname}]="true" # pad "true" for bool flag
        fi
    fi

    # skip the argument to a two word flag
    if [[ ${words[c]} != *"="* ]] && __azion_contains_word "${words[c]}" "${two_word_flags[@]}"; then
        __azion_debug "${FUNCNAME[0]}: found a flag ${words[c]}, skip the next argument"
        c=$((c+1))
        # if we are looking for a flags value, don't show commands
        if [[ $c -eq $cword ]]; then
            commands=()
        fi
    fi

    c=$((c+1))

}

__azion_handle_noun()
{
    __azion_debug "${FUNCNAME[0]}: c is $c words[c] is ${words[c]}"

    if __azion_contains_word "${words[c]}" "${must_have_one_noun[@]}"; then
        must_have_one_noun=()
    elif __azion_contains_word "${words[c]}" "${noun_aliases[@]}"; then
        must_have_one_noun=()
    fi

    nouns+=("${words[c]}")
    c=$((c+1))
}

__azion_handle_command()
{
    __azion_debug "${FUNCNAME[0]}: c is $c words[c] is ${words[c]}"

    local next_command
    if [[ -n ${last_command} ]]; then
        next_command="_${last_command}_${words[c]//:/__}"
    else
        if [[ $c -eq 0 ]]; then
            next_command="_azion_root_command"
        else
            next_command="_${words[c]//:/__}"
        fi
    fi
    c=$((c+1))
    __azion_debug "${FUNCNAME[0]}: looking for ${next_command}"
    declare -F "$next_command" >/dev/null && $next_command
}

__azion_handle_word()
{
    if [[ $c -ge $cword ]]; then
        __azion_handle_reply
        return
    fi
    __azion_debug "${FUNCNAME[0]}: c is $c words[c] is ${words[c]}"
    if [[ "${words[c]}" == -* ]]; then
        __azion_handle_flag
    elif __azion_contains_word "${words[c]}" "${commands[@]}"; then
        __azion_handle_command
    elif [[ $c -eq 0 ]]; then
        __azion_handle_command
    elif __azion_contains_word "${words[c]}" "${command_aliases[@]}"; then
        # aliashash variable is an associative array which is only supported in bash > 3.
        if [[ -z "${BASH_VERSION:-}" || "${BASH_VERSINFO[0]:-}" -gt 3 ]]; then
            words[c]=${aliashash[${words[c]}]}
            __azion_handle_command
        else
            __azion_handle_noun
        fi
    else
        __azion_handle_noun
    fi
    __azion_handle_word
}

_azion_build()
{
    last_command="azion_build"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--entry=")
    two_word_flags+=("--entry")
    local_nonpersistent_flags+=("--entry")
    local_nonpersistent_flags+=("--entry=")
    flags+=("--firewall")
    local_nonpersistent_flags+=("--firewall")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--mode=")
    two_word_flags+=("--mode")
    local_nonpersistent_flags+=("--mode")
    local_nonpersistent_flags+=("--mode=")
    flags+=("--preset=")
    two_word_flags+=("--preset")
    local_nonpersistent_flags+=("--preset")
    local_nonpersistent_flags+=("--preset=")
    flags+=("--use-node-polyfills=")
    two_word_flags+=("--use-node-polyfills")
    local_nonpersistent_flags+=("--use-node-polyfills")
    local_nonpersistent_flags+=("--use-node-polyfills=")
    flags+=("--use-own-worker=")
    two_word_flags+=("--use-own-worker")
    local_nonpersistent_flags+=("--use-own-worker")
    local_nonpersistent_flags+=("--use-own-worker=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_completion()
{
    last_command="azion_completion"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    must_have_one_noun+=("bash")
    must_have_one_noun+=("fish")
    must_have_one_noun+=("powershell")
    must_have_one_noun+=("zsh")
    noun_aliases=()
}

_azion_create_cache-setting()
{
    last_command="azion_create_cache-setting"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--adaptive-delivery-action=")
    two_word_flags+=("--adaptive-delivery-action")
    local_nonpersistent_flags+=("--adaptive-delivery-action")
    local_nonpersistent_flags+=("--adaptive-delivery-action=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--browser-cache-settings=")
    two_word_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings=")
    flags+=("--browser-cache-settings-maximum-ttl=")
    two_word_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl=")
    flags+=("--cache-by-cookies=")
    two_word_flags+=("--cache-by-cookies")
    local_nonpersistent_flags+=("--cache-by-cookies")
    local_nonpersistent_flags+=("--cache-by-cookies=")
    flags+=("--cache-by-query-string=")
    two_word_flags+=("--cache-by-query-string")
    local_nonpersistent_flags+=("--cache-by-query-string")
    local_nonpersistent_flags+=("--cache-by-query-string=")
    flags+=("--cdn-cache-settings=")
    two_word_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings=")
    flags+=("--cnd-cache-settings-maximum-ttl=")
    two_word_flags+=("--cnd-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cnd-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cnd-cache-settings-maximum-ttl=")
    flags+=("--cookie-names=")
    two_word_flags+=("--cookie-names")
    local_nonpersistent_flags+=("--cookie-names")
    local_nonpersistent_flags+=("--cookie-names=")
    flags+=("--enable-caching-for-options=")
    two_word_flags+=("--enable-caching-for-options")
    local_nonpersistent_flags+=("--enable-caching-for-options")
    local_nonpersistent_flags+=("--enable-caching-for-options=")
    flags+=("--enable-caching-for-post=")
    two_word_flags+=("--enable-caching-for-post")
    local_nonpersistent_flags+=("--enable-caching-for-post")
    local_nonpersistent_flags+=("--enable-caching-for-post=")
    flags+=("--enable-caching-string-sort=")
    two_word_flags+=("--enable-caching-string-sort")
    local_nonpersistent_flags+=("--enable-caching-string-sort")
    local_nonpersistent_flags+=("--enable-caching-string-sort=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--l2-caching-enabled=")
    two_word_flags+=("--l2-caching-enabled")
    local_nonpersistent_flags+=("--l2-caching-enabled")
    local_nonpersistent_flags+=("--l2-caching-enabled=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--query-string-fields=")
    two_word_flags+=("--query-string-fields")
    local_nonpersistent_flags+=("--query-string-fields")
    local_nonpersistent_flags+=("--query-string-fields=")
    flags+=("--slice-configuration-enabled=")
    two_word_flags+=("--slice-configuration-enabled")
    local_nonpersistent_flags+=("--slice-configuration-enabled")
    local_nonpersistent_flags+=("--slice-configuration-enabled=")
    flags+=("--slice-configuration-range=")
    two_word_flags+=("--slice-configuration-range")
    local_nonpersistent_flags+=("--slice-configuration-range")
    local_nonpersistent_flags+=("--slice-configuration-range=")
    flags+=("--slice-l2-caching-enabled=")
    two_word_flags+=("--slice-l2-caching-enabled")
    local_nonpersistent_flags+=("--slice-l2-caching-enabled")
    local_nonpersistent_flags+=("--slice-l2-caching-enabled=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_domain()
{
    last_command="azion_create_domain"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--active=")
    two_word_flags+=("--active")
    local_nonpersistent_flags+=("--active")
    local_nonpersistent_flags+=("--active=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--cname-access-only=")
    two_word_flags+=("--cname-access-only")
    local_nonpersistent_flags+=("--cname-access-only")
    local_nonpersistent_flags+=("--cname-access-only=")
    flags+=("--cnames=")
    two_word_flags+=("--cnames")
    local_nonpersistent_flags+=("--cnames")
    local_nonpersistent_flags+=("--cnames=")
    flags+=("--digital-certificate-id=")
    two_word_flags+=("--digital-certificate-id")
    local_nonpersistent_flags+=("--digital-certificate-id")
    local_nonpersistent_flags+=("--digital-certificate-id=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_edge-application()
{
    last_command="azion_create_edge-application"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--address=")
    two_word_flags+=("--address")
    local_nonpersistent_flags+=("--address")
    local_nonpersistent_flags+=("--address=")
    flags+=("--browser-cache-settings=")
    two_word_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings=")
    flags+=("--browser-cache-settings-maximum-ttl=")
    two_word_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl=")
    flags+=("--cdn-cache-settings=")
    two_word_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings=")
    flags+=("--cdn-cache-settings-maximum-ttl=")
    two_word_flags+=("--cdn-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cdn-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cdn-cache-settings-maximum-ttl=")
    flags+=("--debug-rules=")
    two_word_flags+=("--debug-rules")
    local_nonpersistent_flags+=("--debug-rules")
    local_nonpersistent_flags+=("--debug-rules=")
    flags+=("--delivery-protocol=")
    two_word_flags+=("--delivery-protocol")
    local_nonpersistent_flags+=("--delivery-protocol")
    local_nonpersistent_flags+=("--delivery-protocol=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--host-header=")
    two_word_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header=")
    flags+=("--http-port=")
    two_word_flags+=("--http-port")
    local_nonpersistent_flags+=("--http-port")
    local_nonpersistent_flags+=("--http-port=")
    flags+=("--http3=")
    two_word_flags+=("--http3")
    local_nonpersistent_flags+=("--http3")
    local_nonpersistent_flags+=("--http3=")
    flags+=("--https-port=")
    two_word_flags+=("--https-port")
    local_nonpersistent_flags+=("--https-port")
    local_nonpersistent_flags+=("--https-port=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--origin-protocol-policy=")
    two_word_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy=")
    flags+=("--origin-type=")
    two_word_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type=")
    flags+=("--supported-ciphers=")
    two_word_flags+=("--supported-ciphers")
    local_nonpersistent_flags+=("--supported-ciphers")
    local_nonpersistent_flags+=("--supported-ciphers=")
    flags+=("--websocket=")
    two_word_flags+=("--websocket")
    local_nonpersistent_flags+=("--websocket")
    local_nonpersistent_flags+=("--websocket=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_edge-function()
{
    last_command="azion_create_edge-function"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--active=")
    two_word_flags+=("--active")
    local_nonpersistent_flags+=("--active")
    local_nonpersistent_flags+=("--active=")
    flags+=("--args=")
    two_word_flags+=("--args")
    local_nonpersistent_flags+=("--args")
    local_nonpersistent_flags+=("--args=")
    flags+=("--code=")
    two_word_flags+=("--code")
    local_nonpersistent_flags+=("--code")
    local_nonpersistent_flags+=("--code=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_edge-storage_bucket()
{
    last_command="azion_create_edge-storage_bucket"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--edge-access=")
    two_word_flags+=("--edge-access")
    local_nonpersistent_flags+=("--edge-access")
    local_nonpersistent_flags+=("--edge-access=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_edge-storage_object()
{
    last_command="azion_create_edge-storage_object"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--bucket-name=")
    two_word_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--object-key=")
    two_word_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key=")
    flags+=("--source=")
    two_word_flags+=("--source")
    local_nonpersistent_flags+=("--source")
    local_nonpersistent_flags+=("--source=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_edge-storage()
{
    last_command="azion_create_edge-storage"

    command_aliases=()

    commands=()
    commands+=("bucket")
    commands+=("object")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_origin()
{
    last_command="azion_create_origin"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--addresses=")
    two_word_flags+=("--addresses")
    local_nonpersistent_flags+=("--addresses")
    local_nonpersistent_flags+=("--addresses=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--bucket=")
    two_word_flags+=("--bucket")
    local_nonpersistent_flags+=("--bucket")
    local_nonpersistent_flags+=("--bucket=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--hmac-access-key=")
    two_word_flags+=("--hmac-access-key")
    local_nonpersistent_flags+=("--hmac-access-key")
    local_nonpersistent_flags+=("--hmac-access-key=")
    flags+=("--hmac-authentication=")
    two_word_flags+=("--hmac-authentication")
    local_nonpersistent_flags+=("--hmac-authentication")
    local_nonpersistent_flags+=("--hmac-authentication=")
    flags+=("--hmac-region-name=")
    two_word_flags+=("--hmac-region-name")
    local_nonpersistent_flags+=("--hmac-region-name")
    local_nonpersistent_flags+=("--hmac-region-name=")
    flags+=("--hmac-secret-key=")
    two_word_flags+=("--hmac-secret-key")
    local_nonpersistent_flags+=("--hmac-secret-key")
    local_nonpersistent_flags+=("--hmac-secret-key=")
    flags+=("--host-header=")
    two_word_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--origin-path=")
    two_word_flags+=("--origin-path")
    local_nonpersistent_flags+=("--origin-path")
    local_nonpersistent_flags+=("--origin-path=")
    flags+=("--origin-protocol-policy=")
    two_word_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy=")
    flags+=("--origin-type=")
    two_word_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type=")
    flags+=("--prefix=")
    two_word_flags+=("--prefix")
    local_nonpersistent_flags+=("--prefix")
    local_nonpersistent_flags+=("--prefix=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_personal-token()
{
    last_command="azion_create_personal-token"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--description=")
    two_word_flags+=("--description")
    local_nonpersistent_flags+=("--description")
    local_nonpersistent_flags+=("--description=")
    flags+=("--expiration=")
    two_word_flags+=("--expiration")
    local_nonpersistent_flags+=("--expiration")
    local_nonpersistent_flags+=("--expiration=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_rules-engine()
{
    last_command="azion_create_rules-engine"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--phase=")
    two_word_flags+=("--phase")
    local_nonpersistent_flags+=("--phase")
    local_nonpersistent_flags+=("--phase=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create_variables()
{
    last_command="azion_create_variables"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--key=")
    two_word_flags+=("--key")
    local_nonpersistent_flags+=("--key")
    local_nonpersistent_flags+=("--key=")
    flags+=("--secret=")
    two_word_flags+=("--secret")
    local_nonpersistent_flags+=("--secret")
    local_nonpersistent_flags+=("--secret=")
    flags+=("--value=")
    two_word_flags+=("--value")
    local_nonpersistent_flags+=("--value")
    local_nonpersistent_flags+=("--value=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_create()
{
    last_command="azion_create"

    command_aliases=()

    commands=()
    commands+=("cache-setting")
    commands+=("domain")
    commands+=("edge-application")
    commands+=("edge-function")
    commands+=("edge-storage")
    commands+=("origin")
    commands+=("personal-token")
    commands+=("rules-engine")
    commands+=("variables")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_cache-setting()
{
    last_command="azion_delete_cache-setting"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--cache-setting-id=")
    two_word_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_domain()
{
    last_command="azion_delete_domain"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--domain-id=")
    two_word_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_edge-application()
{
    last_command="azion_delete_edge-application"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--cascade")
    local_nonpersistent_flags+=("--cascade")
    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_edge-function()
{
    last_command="azion_delete_edge-function"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--function-id=")
    two_word_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_edge-storage_bucket()
{
    last_command="azion_delete_edge-storage_bucket"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--force")
    local_nonpersistent_flags+=("--force")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_edge-storage_object()
{
    last_command="azion_delete_edge-storage_object"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--bucket-name=")
    two_word_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--object-key=")
    two_word_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_edge-storage()
{
    last_command="azion_delete_edge-storage"

    command_aliases=()

    commands=()
    commands+=("bucket")
    commands+=("object")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_origin()
{
    last_command="azion_delete_origin"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--origin-key=")
    two_word_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_personal-token()
{
    last_command="azion_delete_personal-token"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--id=")
    two_word_flags+=("--id")
    local_nonpersistent_flags+=("--id")
    local_nonpersistent_flags+=("--id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_rules-engine()
{
    last_command="azion_delete_rules-engine"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--phase=")
    two_word_flags+=("--phase")
    local_nonpersistent_flags+=("--phase")
    local_nonpersistent_flags+=("--phase=")
    flags+=("--rule-id=")
    two_word_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete_variables()
{
    last_command="azion_delete_variables"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--variable-id=")
    two_word_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_delete()
{
    last_command="azion_delete"

    command_aliases=()

    commands=()
    commands+=("cache-setting")
    commands+=("domain")
    commands+=("edge-application")
    commands+=("edge-function")
    commands+=("edge-storage")
    commands+=("origin")
    commands+=("personal-token")
    commands+=("rules-engine")
    commands+=("variables")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_deploy()
{
    last_command="azion_deploy"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--auto")
    local_nonpersistent_flags+=("--auto")
    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--env=")
    two_word_flags+=("--env")
    local_nonpersistent_flags+=("--env")
    local_nonpersistent_flags+=("--env=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--no-prompt")
    local_nonpersistent_flags+=("--no-prompt")
    flags+=("--path=")
    two_word_flags+=("--path")
    local_nonpersistent_flags+=("--path")
    local_nonpersistent_flags+=("--path=")
    flags+=("--skip-build")
    local_nonpersistent_flags+=("--skip-build")
    flags+=("--sync")
    local_nonpersistent_flags+=("--sync")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_deploy-remote()
{
    last_command="azion_deploy-remote"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--auto")
    local_nonpersistent_flags+=("--auto")
    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--env=")
    two_word_flags+=("--env")
    local_nonpersistent_flags+=("--env")
    local_nonpersistent_flags+=("--env=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--no-prompt")
    local_nonpersistent_flags+=("--no-prompt")
    flags+=("--path=")
    two_word_flags+=("--path")
    local_nonpersistent_flags+=("--path")
    local_nonpersistent_flags+=("--path=")
    flags+=("--skip-build")
    local_nonpersistent_flags+=("--skip-build")
    flags+=("--sync")
    local_nonpersistent_flags+=("--sync")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_cache-setting()
{
    last_command="azion_describe_cache-setting"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--cache-setting-id=")
    two_word_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_domain()
{
    last_command="azion_describe_domain"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--domain-id=")
    two_word_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_edge-application()
{
    last_command="azion_describe_edge-application"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_edge-function()
{
    last_command="azion_describe_edge-function"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--function-id=")
    two_word_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--with-code")
    local_nonpersistent_flags+=("--with-code")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_edge-storage_object()
{
    last_command="azion_describe_edge-storage_object"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--bucket-name=")
    two_word_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--object-key=")
    two_word_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_edge-storage()
{
    last_command="azion_describe_edge-storage"

    command_aliases=()

    commands=()
    commands+=("object")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_origin()
{
    last_command="azion_describe_origin"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--origin-key=")
    two_word_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_personal-token()
{
    last_command="azion_describe_personal-token"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--id=")
    two_word_flags+=("--id")
    local_nonpersistent_flags+=("--id")
    local_nonpersistent_flags+=("--id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_rules-engine()
{
    last_command="azion_describe_rules-engine"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--phase=")
    two_word_flags+=("--phase")
    local_nonpersistent_flags+=("--phase")
    local_nonpersistent_flags+=("--phase=")
    flags+=("--rule-id=")
    two_word_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe_variables()
{
    last_command="azion_describe_variables"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--variable-id=")
    two_word_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_describe()
{
    last_command="azion_describe"

    command_aliases=()

    commands=()
    commands+=("cache-setting")
    commands+=("domain")
    commands+=("edge-application")
    commands+=("edge-function")
    commands+=("edge-storage")
    commands+=("origin")
    commands+=("personal-token")
    commands+=("rules-engine")
    commands+=("variables")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_dev()
{
    last_command="azion_dev"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--firewall")
    local_nonpersistent_flags+=("--firewall")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_help()
{
    last_command="azion_help"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    has_completion_function=1
    noun_aliases=()
}

_azion_init()
{
    last_command="azion_init"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--auto")
    local_nonpersistent_flags+=("--auto")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--package-manager=")
    two_word_flags+=("--package-manager")
    local_nonpersistent_flags+=("--package-manager")
    local_nonpersistent_flags+=("--package-manager=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_link()
{
    last_command="azion_link"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--auto")
    local_nonpersistent_flags+=("--auto")
    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--mode=")
    two_word_flags+=("--mode")
    local_nonpersistent_flags+=("--mode")
    local_nonpersistent_flags+=("--mode=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--package-manager=")
    two_word_flags+=("--package-manager")
    local_nonpersistent_flags+=("--package-manager")
    local_nonpersistent_flags+=("--package-manager=")
    flags+=("--preset=")
    two_word_flags+=("--preset")
    local_nonpersistent_flags+=("--preset")
    local_nonpersistent_flags+=("--preset=")
    flags+=("--remote=")
    two_word_flags+=("--remote")
    local_nonpersistent_flags+=("--remote")
    local_nonpersistent_flags+=("--remote=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_cache-setting()
{
    last_command="azion_list_cache-setting"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_domain()
{
    last_command="azion_list_domain"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_edge-application()
{
    last_command="azion_list_edge-application"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_edge-function()
{
    last_command="azion_list_edge-function"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_edge-storage_bucket()
{
    last_command="azion_list_edge-storage_bucket"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_edge-storage_object()
{
    last_command="azion_list_edge-storage_object"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--bucket-name=")
    two_word_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name=")
    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--next-page")
    local_nonpersistent_flags+=("--next-page")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_edge-storage()
{
    last_command="azion_list_edge-storage"

    command_aliases=()

    commands=()
    commands+=("bucket")
    commands+=("object")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_origin()
{
    last_command="azion_list_origin"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_personal-token()
{
    last_command="azion_list_personal-token"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_rules-engine()
{
    last_command="azion_list_rules-engine"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--filter=")
    two_word_flags+=("--filter")
    local_nonpersistent_flags+=("--filter")
    local_nonpersistent_flags+=("--filter=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--order-by=")
    two_word_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by")
    local_nonpersistent_flags+=("--order-by=")
    flags+=("--page=")
    two_word_flags+=("--page")
    local_nonpersistent_flags+=("--page")
    local_nonpersistent_flags+=("--page=")
    flags+=("--page-size=")
    two_word_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size")
    local_nonpersistent_flags+=("--page-size=")
    flags+=("--phase=")
    two_word_flags+=("--phase")
    local_nonpersistent_flags+=("--phase")
    local_nonpersistent_flags+=("--phase=")
    flags+=("--sort=")
    two_word_flags+=("--sort")
    local_nonpersistent_flags+=("--sort")
    local_nonpersistent_flags+=("--sort=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list_variables()
{
    last_command="azion_list_variables"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--details")
    local_nonpersistent_flags+=("--details")
    flags+=("--dump")
    local_nonpersistent_flags+=("--dump")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_list()
{
    last_command="azion_list"

    command_aliases=()

    commands=()
    commands+=("cache-setting")
    commands+=("domain")
    commands+=("edge-application")
    commands+=("edge-function")
    commands+=("edge-storage")
    commands+=("origin")
    commands+=("personal-token")
    commands+=("rules-engine")
    commands+=("variables")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_login()
{
    last_command="azion_login"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--password=")
    two_word_flags+=("--password")
    local_nonpersistent_flags+=("--password")
    local_nonpersistent_flags+=("--password=")
    flags+=("--username=")
    two_word_flags+=("--username")
    local_nonpersistent_flags+=("--username")
    local_nonpersistent_flags+=("--username=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_logout()
{
    last_command="azion_logout"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_logs_cells()
{
    last_command="azion_logs_cells"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--function-id=")
    two_word_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--limit=")
    two_word_flags+=("--limit")
    local_nonpersistent_flags+=("--limit")
    local_nonpersistent_flags+=("--limit=")
    flags+=("--pretty")
    local_nonpersistent_flags+=("--pretty")
    flags+=("--tail")
    local_nonpersistent_flags+=("--tail")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_logs_http()
{
    last_command="azion_logs_http"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--limit=")
    two_word_flags+=("--limit")
    local_nonpersistent_flags+=("--limit")
    local_nonpersistent_flags+=("--limit=")
    flags+=("--pretty")
    local_nonpersistent_flags+=("--pretty")
    flags+=("--tail")
    local_nonpersistent_flags+=("--tail")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_logs()
{
    last_command="azion_logs"

    command_aliases=()

    commands=()
    commands+=("cells")
    commands+=("http")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_purge()
{
    last_command="azion_purge"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--cache-key=")
    two_word_flags+=("--cache-key")
    local_nonpersistent_flags+=("--cache-key")
    local_nonpersistent_flags+=("--cache-key=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--layer=")
    two_word_flags+=("--layer")
    local_nonpersistent_flags+=("--layer")
    local_nonpersistent_flags+=("--layer=")
    flags+=("--urls=")
    two_word_flags+=("--urls")
    local_nonpersistent_flags+=("--urls")
    local_nonpersistent_flags+=("--urls=")
    flags+=("--wildcard=")
    two_word_flags+=("--wildcard")
    local_nonpersistent_flags+=("--wildcard")
    local_nonpersistent_flags+=("--wildcard=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_reset()
{
    last_command="azion_reset"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_sync()
{
    last_command="azion_sync"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--config-dir=")
    two_word_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir")
    local_nonpersistent_flags+=("--config-dir=")
    flags+=("--env=")
    two_word_flags+=("--env")
    local_nonpersistent_flags+=("--env")
    local_nonpersistent_flags+=("--env=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_unlink()
{
    last_command="azion_unlink"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_cache-setting()
{
    last_command="azion_update_cache-setting"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--adaptive-delivery-action=")
    two_word_flags+=("--adaptive-delivery-action")
    local_nonpersistent_flags+=("--adaptive-delivery-action")
    local_nonpersistent_flags+=("--adaptive-delivery-action=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--browser-cache-settings=")
    two_word_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings")
    local_nonpersistent_flags+=("--browser-cache-settings=")
    flags+=("--browser-cache-settings-maximum-ttl=")
    two_word_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--browser-cache-settings-maximum-ttl=")
    flags+=("--cache-by-cookies=")
    two_word_flags+=("--cache-by-cookies")
    local_nonpersistent_flags+=("--cache-by-cookies")
    local_nonpersistent_flags+=("--cache-by-cookies=")
    flags+=("--cache-by-query-string=")
    two_word_flags+=("--cache-by-query-string")
    local_nonpersistent_flags+=("--cache-by-query-string")
    local_nonpersistent_flags+=("--cache-by-query-string=")
    flags+=("--cache-setting-id=")
    two_word_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id")
    local_nonpersistent_flags+=("--cache-setting-id=")
    flags+=("--cdn-cache-settings=")
    two_word_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings")
    local_nonpersistent_flags+=("--cdn-cache-settings=")
    flags+=("--cnd-cache-settings-maximum-ttl=")
    two_word_flags+=("--cnd-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cnd-cache-settings-maximum-ttl")
    local_nonpersistent_flags+=("--cnd-cache-settings-maximum-ttl=")
    flags+=("--cookie-names=")
    two_word_flags+=("--cookie-names")
    local_nonpersistent_flags+=("--cookie-names")
    local_nonpersistent_flags+=("--cookie-names=")
    flags+=("--enable-caching-for-options=")
    two_word_flags+=("--enable-caching-for-options")
    local_nonpersistent_flags+=("--enable-caching-for-options")
    local_nonpersistent_flags+=("--enable-caching-for-options=")
    flags+=("--enable-caching-for-post=")
    two_word_flags+=("--enable-caching-for-post")
    local_nonpersistent_flags+=("--enable-caching-for-post")
    local_nonpersistent_flags+=("--enable-caching-for-post=")
    flags+=("--enable-caching-string-sort=")
    two_word_flags+=("--enable-caching-string-sort")
    local_nonpersistent_flags+=("--enable-caching-string-sort")
    local_nonpersistent_flags+=("--enable-caching-string-sort=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--l2-caching-enabled=")
    two_word_flags+=("--l2-caching-enabled")
    local_nonpersistent_flags+=("--l2-caching-enabled")
    local_nonpersistent_flags+=("--l2-caching-enabled=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--query-string-fields=")
    two_word_flags+=("--query-string-fields")
    local_nonpersistent_flags+=("--query-string-fields")
    local_nonpersistent_flags+=("--query-string-fields=")
    flags+=("--slice-configuration-enabled=")
    two_word_flags+=("--slice-configuration-enabled")
    local_nonpersistent_flags+=("--slice-configuration-enabled")
    local_nonpersistent_flags+=("--slice-configuration-enabled=")
    flags+=("--slice-configuration-range=")
    two_word_flags+=("--slice-configuration-range")
    local_nonpersistent_flags+=("--slice-configuration-range")
    local_nonpersistent_flags+=("--slice-configuration-range=")
    flags+=("--slice-l2-caching-enabled=")
    two_word_flags+=("--slice-l2-caching-enabled")
    local_nonpersistent_flags+=("--slice-l2-caching-enabled")
    local_nonpersistent_flags+=("--slice-l2-caching-enabled=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_domain()
{
    last_command="azion_update_domain"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--active=")
    two_word_flags+=("--active")
    local_nonpersistent_flags+=("--active")
    local_nonpersistent_flags+=("--active=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--cname-access-only=")
    two_word_flags+=("--cname-access-only")
    local_nonpersistent_flags+=("--cname-access-only")
    local_nonpersistent_flags+=("--cname-access-only=")
    flags+=("--cnames=")
    two_word_flags+=("--cnames")
    local_nonpersistent_flags+=("--cnames")
    local_nonpersistent_flags+=("--cnames=")
    flags+=("--digital-certificate-id=")
    two_word_flags+=("--digital-certificate-id")
    local_nonpersistent_flags+=("--digital-certificate-id")
    local_nonpersistent_flags+=("--digital-certificate-id=")
    flags+=("--domain-id=")
    two_word_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id")
    local_nonpersistent_flags+=("--domain-id=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_edge-application()
{
    last_command="azion_update_edge-application"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-acceleration=")
    two_word_flags+=("--application-acceleration")
    local_nonpersistent_flags+=("--application-acceleration")
    local_nonpersistent_flags+=("--application-acceleration=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--delivery-protocol=")
    two_word_flags+=("--delivery-protocol")
    local_nonpersistent_flags+=("--delivery-protocol")
    local_nonpersistent_flags+=("--delivery-protocol=")
    flags+=("--device-detection=")
    two_word_flags+=("--device-detection")
    local_nonpersistent_flags+=("--device-detection")
    local_nonpersistent_flags+=("--device-detection=")
    flags+=("--edge-firewall=")
    two_word_flags+=("--edge-firewall")
    local_nonpersistent_flags+=("--edge-firewall")
    local_nonpersistent_flags+=("--edge-firewall=")
    flags+=("--edge-functions=")
    two_word_flags+=("--edge-functions")
    local_nonpersistent_flags+=("--edge-functions")
    local_nonpersistent_flags+=("--edge-functions=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--http-port=")
    two_word_flags+=("--http-port")
    local_nonpersistent_flags+=("--http-port")
    local_nonpersistent_flags+=("--http-port=")
    flags+=("--https-port=")
    two_word_flags+=("--https-port")
    local_nonpersistent_flags+=("--https-port")
    local_nonpersistent_flags+=("--https-port=")
    flags+=("--image-optimization=")
    two_word_flags+=("--image-optimization")
    local_nonpersistent_flags+=("--image-optimization")
    local_nonpersistent_flags+=("--image-optimization=")
    flags+=("--l2-caching=")
    two_word_flags+=("--l2-caching")
    local_nonpersistent_flags+=("--l2-caching")
    local_nonpersistent_flags+=("--l2-caching=")
    flags+=("--load-balancer=")
    two_word_flags+=("--load-balancer")
    local_nonpersistent_flags+=("--load-balancer")
    local_nonpersistent_flags+=("--load-balancer=")
    flags+=("--min-tsl-ver=")
    two_word_flags+=("--min-tsl-ver")
    local_nonpersistent_flags+=("--min-tsl-ver")
    local_nonpersistent_flags+=("--min-tsl-ver=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--raw-logs=")
    two_word_flags+=("--raw-logs")
    local_nonpersistent_flags+=("--raw-logs")
    local_nonpersistent_flags+=("--raw-logs=")
    flags+=("--webapp-firewall=")
    two_word_flags+=("--webapp-firewall")
    local_nonpersistent_flags+=("--webapp-firewall")
    local_nonpersistent_flags+=("--webapp-firewall=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_edge-function()
{
    last_command="azion_update_edge-function"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--active=")
    two_word_flags+=("--active")
    local_nonpersistent_flags+=("--active")
    local_nonpersistent_flags+=("--active=")
    flags+=("--args=")
    two_word_flags+=("--args")
    local_nonpersistent_flags+=("--args")
    local_nonpersistent_flags+=("--args=")
    flags+=("--code=")
    two_word_flags+=("--code")
    local_nonpersistent_flags+=("--code")
    local_nonpersistent_flags+=("--code=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--function-id=")
    two_word_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id")
    local_nonpersistent_flags+=("--function-id=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_edge-storage_bucket()
{
    last_command="azion_update_edge-storage_bucket"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--edge-access=")
    two_word_flags+=("--edge-access")
    local_nonpersistent_flags+=("--edge-access")
    local_nonpersistent_flags+=("--edge-access=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_edge-storage_object()
{
    last_command="azion_update_edge-storage_object"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--bucket-name=")
    two_word_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name")
    local_nonpersistent_flags+=("--bucket-name=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--object-key=")
    two_word_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key")
    local_nonpersistent_flags+=("--object-key=")
    flags+=("--source=")
    two_word_flags+=("--source")
    local_nonpersistent_flags+=("--source")
    local_nonpersistent_flags+=("--source=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_edge-storage()
{
    last_command="azion_update_edge-storage"

    command_aliases=()

    commands=()
    commands+=("bucket")
    commands+=("object")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_origin()
{
    last_command="azion_update_origin"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--addresses=")
    two_word_flags+=("--addresses")
    local_nonpersistent_flags+=("--addresses")
    local_nonpersistent_flags+=("--addresses=")
    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--bucket=")
    two_word_flags+=("--bucket")
    local_nonpersistent_flags+=("--bucket")
    local_nonpersistent_flags+=("--bucket=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--hmac-access-key=")
    two_word_flags+=("--hmac-access-key")
    local_nonpersistent_flags+=("--hmac-access-key")
    local_nonpersistent_flags+=("--hmac-access-key=")
    flags+=("--hmac-authentication=")
    two_word_flags+=("--hmac-authentication")
    local_nonpersistent_flags+=("--hmac-authentication")
    local_nonpersistent_flags+=("--hmac-authentication=")
    flags+=("--hmac-region-name=")
    two_word_flags+=("--hmac-region-name")
    local_nonpersistent_flags+=("--hmac-region-name")
    local_nonpersistent_flags+=("--hmac-region-name=")
    flags+=("--hmac-secret-key=")
    two_word_flags+=("--hmac-secret-key")
    local_nonpersistent_flags+=("--hmac-secret-key")
    local_nonpersistent_flags+=("--hmac-secret-key=")
    flags+=("--host-header=")
    two_word_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header")
    local_nonpersistent_flags+=("--host-header=")
    flags+=("--name=")
    two_word_flags+=("--name")
    local_nonpersistent_flags+=("--name")
    local_nonpersistent_flags+=("--name=")
    flags+=("--origin-key=")
    two_word_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key")
    local_nonpersistent_flags+=("--origin-key=")
    flags+=("--origin-path=")
    two_word_flags+=("--origin-path")
    local_nonpersistent_flags+=("--origin-path")
    local_nonpersistent_flags+=("--origin-path=")
    flags+=("--origin-protocol-policy=")
    two_word_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy")
    local_nonpersistent_flags+=("--origin-protocol-policy=")
    flags+=("--origin-type=")
    two_word_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type")
    local_nonpersistent_flags+=("--origin-type=")
    flags+=("--prefix=")
    two_word_flags+=("--prefix")
    local_nonpersistent_flags+=("--prefix")
    local_nonpersistent_flags+=("--prefix=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_rules-engine()
{
    last_command="azion_update_rules-engine"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--application-id=")
    two_word_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id")
    local_nonpersistent_flags+=("--application-id=")
    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--phase=")
    two_word_flags+=("--phase")
    local_nonpersistent_flags+=("--phase")
    local_nonpersistent_flags+=("--phase=")
    flags+=("--rule-id=")
    two_word_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id")
    local_nonpersistent_flags+=("--rule-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update_variables()
{
    last_command="azion_update_variables"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--file=")
    two_word_flags+=("--file")
    local_nonpersistent_flags+=("--file")
    local_nonpersistent_flags+=("--file=")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--key=")
    two_word_flags+=("--key")
    local_nonpersistent_flags+=("--key")
    local_nonpersistent_flags+=("--key=")
    flags+=("--secret=")
    two_word_flags+=("--secret")
    local_nonpersistent_flags+=("--secret")
    local_nonpersistent_flags+=("--secret=")
    flags+=("--value=")
    two_word_flags+=("--value")
    local_nonpersistent_flags+=("--value")
    local_nonpersistent_flags+=("--value=")
    flags+=("--variable-id=")
    two_word_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id")
    local_nonpersistent_flags+=("--variable-id=")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_update()
{
    last_command="azion_update"

    command_aliases=()

    commands=()
    commands+=("cache-setting")
    commands+=("domain")
    commands+=("edge-application")
    commands+=("edge-function")
    commands+=("edge-storage")
    commands+=("origin")
    commands+=("rules-engine")
    commands+=("variables")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_version()
{
    last_command="azion_version"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_whoami()
{
    last_command="azion_whoami"

    command_aliases=()

    commands=()

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

_azion_root_command()
{
    last_command="azion"

    command_aliases=()

    commands=()
    commands+=("build")
    commands+=("completion")
    commands+=("create")
    commands+=("delete")
    commands+=("deploy")
    commands+=("deploy-remote")
    commands+=("describe")
    commands+=("dev")
    commands+=("help")
    commands+=("init")
    commands+=("link")
    commands+=("list")
    commands+=("login")
    commands+=("logout")
    commands+=("logs")
    commands+=("purge")
    commands+=("reset")
    commands+=("sync")
    commands+=("unlink")
    commands+=("update")
    commands+=("version")
    commands+=("whoami")

    flags=()
    two_word_flags=()
    local_nonpersistent_flags=()
    flags_with_completion=()
    flags_completion=()

    flags+=("--config=")
    two_word_flags+=("--config")
    two_word_flags+=("-c")
    flags+=("--debug")
    flags+=("-d")
    flags+=("--format=")
    two_word_flags+=("--format")
    flags+=("--help")
    flags+=("-h")
    local_nonpersistent_flags+=("--help")
    local_nonpersistent_flags+=("-h")
    flags+=("--log-level=")
    two_word_flags+=("--log-level")
    two_word_flags+=("-l")
    flags+=("--no-color")
    flags+=("--out=")
    two_word_flags+=("--out")
    flags+=("--silent")
    flags+=("-s")
    flags+=("--token=")
    two_word_flags+=("--token")
    two_word_flags+=("-t")
    flags+=("--yes")
    flags+=("-y")

    must_have_one_flag=()
    must_have_one_noun=()
    noun_aliases=()
}

__start_azion()
{
    local cur prev words cword split
    declare -A flaghash 2>/dev/null || :
    declare -A aliashash 2>/dev/null || :
    if declare -F _init_completion >/dev/null 2>&1; then
        _init_completion -s || return
    else
        __azion_init_completion -n "=" || return
    fi

    local c=0
    local flag_parsing_disabled=
    local flags=()
    local two_word_flags=()
    local local_nonpersistent_flags=()
    local flags_with_completion=()
    local flags_completion=()
    local commands=("azion")
    local command_aliases=()
    local must_have_one_flag=()
    local must_have_one_noun=()
    local has_completion_function=""
    local last_command=""
    local nouns=()
    local noun_aliases=()

    __azion_handle_word
}

if [[ $(type -t compopt) = "builtin" ]]; then
    complete -o default -F __start_azion azion
else
    complete -o default -o nospace -F __start_azion azion
fi

# ex: ts=4 sw=4 et filetype=sh
