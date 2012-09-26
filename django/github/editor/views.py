from django.http import HttpResponse
from django.shortcuts import render_to_response

from django.template.loader import get_template
from django.template import Context


from django.contrib.auth import BACKEND_SESSION_KEY
from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext

from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache

from social_auth.models import UserSocialAuth
from social_auth.views import complete as social_complete
from social_auth.utils import setting
from social_auth.backends.contrib.github import GithubBackend

def editor(request, name='index.html'):
	t = get_template('index.html')
	html = t.render(Context({}))
	return HttpResponse(html)

def editor22(request, name='index.html'):
        t = get_template('editor.html')
        html = t.render(Context({}))
        return HttpResponse(html)

def error(request, name='index.html'):
        t = get_template('500.html')
        html = t.render(Context({}))
        return HttpResponse(html)

def is_complete_authentication(request):
    return request.user.is_authenticated() and GithubBackend.__name__ in request.session.get(BACKEND_SESSION_KEY, '')

def get_access_token(user):
    key = str(user.id)
    access_token = cache.get(key)

    # If cache is empty read the database
    if access_token is None:
        try:
            social_user = user.social_user if hasattr(user, 'social_user') \
                                           else UserSocialAuth.objects.get(user=user.id, provider=GithubBackend.name)
        except UserSocialAuth.DoesNotExist:
            return None

        if social_user.extra_data:
            access_token = social_user.extra_data.get('access_token')
            expires = social_user.extra_data.get('expires')

            cache.set(key, access_token, int(expires) if expires is not None else 0)

    return access_token

# Facebook decorator to setup environment
def facebook_decorator(func):
    def wrapper(request, *args, **kwargs):
        user = request.user

        # User must me logged via FB backend in order to ensure we talk about the same person
        if not is_complete_authentication(request):
            try:
                user = social_complete(request, GithubBackend.name)
            except ValueError:
                pass # no matter if failed

        # Not recommended way for FB, but still something we need to be aware of
        if isinstance(user, HttpResponse):
            kwargs.update({'auth_response': user})
        # Need to re-check the completion
        else:
            if is_complete_authentication(request):
                kwargs.update({'access_token': get_access_token(request.user)})
            else:
                request.user = AnonymousUser()

        return func(request, *args, **kwargs)

    return wrapper


@csrf_exempt
@facebook_decorator
def editor2(request, *args, **kwargs):
    # If there is a ready response just return it. Not recommended though.
    auth_response =  kwargs.get('auth_response')
    if auth_response:
        return auth_response

    return render_to_response('editor.html', {'warning': request.method == 'GET', 'access_token': get_access_token(request.user)}, RequestContext(request))